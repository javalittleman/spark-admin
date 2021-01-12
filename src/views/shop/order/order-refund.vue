<template>
  <div class="app-container">
    <div v-show="showStatus" class="filter-container">
      <div class="form-group">
        <label class="control-label">订单编号:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.orderSn" style="width: 200px;" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">退款编号:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.refundSn" style="width: 200px;" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">退款状态:</label>
        <div class="control-inline">
          <el-select v-model="listQuery.refundStatus" style="width: 160px">
            <el-option v-for="item in statusOptions" :key="Number(item.value)" :label="item.label+'('+item.value+')'" :value="Number(item.value)" />
          </el-select>
        </div>
      </div>
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        plain
        @click="handleFilter"
      >查询</el-button>
      <el-button
        v-waves
        type="warning"
        class="filter-item"
        icon="el-icon-delete"
        plain
        @click="reset"
      >重置</el-button>
    </div>
    <div class="table-opts">
      <div class="table-opts-left" />
      <div class="el-button-group table-opts-right">
        <el-button icon="el-icon-search" circle @click="showClick" />
        <el-button icon="el-icon-refresh" circle @click="handleFilter" />
      </div>
    </div>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="加载中"
      :header-cell-style="{background: '#f8f8f9'}"
      border
      fit
      highlight-current-row
    >
      <el-table-column label="用户编号" prop="user.nickname" />
      <el-table-column label="退款单号">
        <template slot-scope="scope">
          <div>订单单号：{{ scope.row.orderSn }}</div>
          <div>退款单号：{{ scope.row.refundSn }}</div>
          <el-tag type="success">{{ scope.row.refundStatus | dictLabel('refund_status') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="商品信息">
        <template slot-scope="scope">
          <el-row>
            <el-col :span="8">
              <el-image style="width: 50px; height: 50px" :src="scope.row.orderGoods.picUrl" fit="fit" />
            </el-col>
            <el-col :span="14">
              <div>{{ scope.row.orderGoods.goodsTitle }}</div>
              <div>{{ scope.row.orderGoods.goodsAttrVals }} 数量: {{ scope.row.orderGoods.number }}</div>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column label="退款金额">
        <template slot-scope="scope">
          <div>订单金额: {{ scope.row.orderAmount }} </div>
          <div>退款金额: {{ scope.row.refundAmount }} </div>
        </template>
      </el-table-column>
      <el-table-column label="退款信息">
        <template slot-scope="scope">
          <el-row>
            <el-col v-if="scope.row.img" :span="8">
              <el-image style="width: 50px; height: 50px" :src="scope.row.img" fit="fit" />
            </el-col>
            <el-col :span="14">
              <div>数量: {{ scope.row.num }}</div>
              <div>原因：{{ scope.row.reason }}</div>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column label="拒绝退款原因" prop="refusedReason" />
      <el-table-column label="时间">
        <template slot-scope="scope">
          <div>申请时间:{{ scope.row.createDate | parseTime }}</div>
          <div>确认时间:{{ scope.row.refundTime | parseTime }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="100" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="row.refundStatus === 0" type="text" size="mini" icon="el-icon-document-checked" @click="handleConfirm(row)" />
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.current"
      :limit.sync="listQuery.size"
      @pagination="getList"
    />

    <el-dialog title="确认信息" :visible.sync="dialogConfirmVisible" width="400px">
      <el-form ref="dataForm" label-position="right" label-width="90px" label-suffix=":" style="margin-left:10px;">
        <el-form-item label="是否同意">
          <el-switch v-model="confirmData.isAgree" active-text="同意" inactive-text="不同意" />
        </el-form-item>
        <el-form-item v-if="!confirmData.isAgree" label="拒绝理由">
          <el-input v-model="confirmData.refusedReason" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogConfirmVisible = false">
          取消
        </el-button>
        <el-button :loading="confirmLoading" type="primary" @click="saveConfirm">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import * as refund from '@/api/shop/order/refund.js'
import { resetData } from '@/utils'
import { getDictList } from '@/utils/dict'

export default {
  name: 'WxShopOrderRefund',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      showStatus: true,
      dialogConfirmVisible: false,
      confirmLoading: false,
      statusOptions: getDictList('refund_status'),
      listQuery: {
        current: 1,
        size: 20,
        orderSn: null,
        refundSn: null,
        refundStatus: null
      },
      confirmData: {
        id: null,
        isAgree: true,
        refusedReason: null
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      refund.page(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listQuery.current = response.data.current
        this.listQuery.size = response.data.size
        this.listLoading = false
      })
    },
    showClick() {
      // 控制查询条件显示隐藏
      this.showStatus = !this.showStatus
    },
    reset() {
      resetData(this.listQuery, { current: 1, size: 20 })
    },
    handleFilter() {
      this.listQuery.current = 1
      this.getList()
    },
    handleConfirm(row) {
      this.confirmData.id = row.id
      this.dialogConfirmVisible = true
    },
    saveConfirm() {
      this.$confirm('是否确定?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        refund.refund(this.confirmData).then(response => {
          this.dialogConfirmVisible = false
          this.confirmLoading = false
          this.handleFilter()
        })
      })
    }
  }
}
</script>
