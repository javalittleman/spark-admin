<template>
  <div>
    <div class="filter-container">
      <cards :lg="4" :card-lists="cardLists" @handleClick="handleClick" />
      <div class="form-group">
        <label class="control-label">订单状态:</label>
        <div class="control-inline">
          <el-select v-model="listQuery.orderStatus" placeholder="订单状态" style="width: 160px">
            <el-option v-for="item in statusOptions" :key="Number(item.value)" :label="item.label+'('+item.value+')'" :value="Number(item.value)" />
          </el-select>
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">用户编号:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.userId" placeholder="用户编号" style="width: 200px;" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">订单编号:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.orderSn" placeholder="订单编号" style="width: 200px;" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">下单时间:</label>
        <div class="control-inline">
          <el-date-picker v-model="listQuery.createDate" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">支付时间:</label>
        <div class="control-inline">
          <el-date-picker v-model="listQuery.payTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" />
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
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="加载中"
      :header-cell-style="{background: '#f8f8f9'}"
      border
      fit
    >
      <el-table-column label="订单编号">
        <template slot-scope="scope">
          <div><router-link :to="'/order/detail/'+scope.row.id" class="link-type">{{ scope.row.orderSn }}</router-link></div>
          <div>订单状态：<el-tag type="success">{{ scope.row.orderStatus | dictLabel('order_status') }}</el-tag></div>
          <div>发货状态:<el-tag type="success">{{ scope.row.shippingStatus | dictLabel('shipping_status') }}</el-tag></div>
          <div v-if="scope.row.hasOwnProperty('refundStatus')">退货状态:<el-tag type="success">{{ scope.row.refundStatus | dictLabel('refund_status') }}</el-tag></div>
        </template>
      </el-table-column>
      <el-table-column label="买家" prop="user.nickname" />
      <el-table-column label="订单信息">
        <template slot-scope="scope">
          <div>下单时间：{{ scope.row.createDate | parseTime }} </div>
          <div>支付时间：{{ scope.row.payTime | parseTime }} </div>
          <div>收货时间：{{ scope.row.confirmTime | parseTime }} </div>
        </template>
      </el-table-column>
      <el-table-column label="商品信息">
        <template slot-scope="scope">
          <el-row v-for="goods in scope.row.goodsList" :key="goods.id">
            <el-col :span="8">
              <el-image style="width: 50px; height: 50px" :src="goods.picUrl" fit="fit" />
            </el-col>
            <el-col :span="14">
              <div>ID：{{ goods.id }}</div>
              <div>{{ goods.goodsTitle }}</div>
              <div>{{ goods.goodsAttrVals }} 数量: {{ goods.number }}</div>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column label="总价">
        <template slot-scope="scope">
          <div>订单总价：{{ scope.row.orderPrice }} </div>
          <div>商品总价：{{ scope.row.goodsPrice }} </div>
        </template>
      </el-table-column>
      <el-table-column label="备注">
        <template slot-scope="scope">
          <div>用户备注：{{ scope.row.userRemarks }} </div>
          <div>订单备注：{{ scope.row.remarks }} </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="row.orderStatus === 0 || row.orderStatus === 1" type="text" size="mini" icon="el-icon-tickets" @click="handleCancel(row)">取消</el-button>
          <el-button v-if="row.orderStatus === 2" type="text" size="mini" icon="el-icon-truck" @click="handleSend(row)">发货</el-button>
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
    <el-dialog title="物流信息" :visible.sync="dialogSendVisible" width="400px">
      <el-form ref="dataForm" label-position="right" label-width="90px" label-suffix=":" style="margin-left:10px;">
        <el-form-item label="物流公司" prop="shipperName">
          <el-select v-model="sendData.shipperCode" placeholder="物流公司" style="width:100%" @change="handleSel">
            <el-option
              v-for="item in shipperOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="快递单号" prop="shipperCode">
          <el-input v-model="sendData.logisticCode" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogSendVisible = false">
          取消
        </el-button>
        <el-button :loading="confirmLoading" type="primary" @click="sendExpress">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import Cards from '@/components/Cards'
import * as order from '@/api/shop/order/order.js'
import { resetData } from '@/utils'
import { getDictList } from '@/utils/dict'

export default {
  name: 'WxShopOrderTable',
  components: { Pagination, Cards },
  directives: { waves },
  props: {
    orderType: {
      required: true,
      type: String
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      dialogSendVisible: false,
      confirmLoading: false,
      statusOptions: getDictList('order_status'),
      shipperOptions: getDictList('express_company'),
      listQuery: {
        current: 1,
        size: 20,
        orderStatus: 0,
        orderSn: null
      },
      sendData: {
        id: null,
        shipperName: null,
        shipperCode: null,
        logisticCode: null
      },
      cardLists: [
        {
          id: 0,
          icon: 'payment-clock',
          text: '待付款',
          num: 2
        },
        {
          id: 2,
          icon: 'order-today',
          text: '已付款',
          num: 1
        },
        {
          id: 3,
          icon: 'send',
          text: '已发货',
          num: 3
        },
        {
          id: 1,
          icon: 'order-cancel',
          text: '取消订单',
          num: 4
        },
        {
          id: 4,
          icon: 'order-refund',
          text: '退款',
          num: 5
        },
        {
          id: 7,
          icon: 'order-evaluation',
          text: '待评价',
          num: 6
        }
      ]
    }
  },
  created() {
    this.statusCount()
    this.getList()
  },
  methods: {
    statusCount() {
      order.count(this.orderType).then(response => {
        const map = response.data
        this.cardLists.forEach(e => {
          e.num = map[e.id] || 0
        })
      })
    },
    getList() {
      this.listLoading = true
      this.listQuery['orderType'] = this.orderType
      order.page(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listQuery.current = response.data.current
        this.listQuery.size = response.data.size
        this.listLoading = false
      })
    },
    reset() {
      resetData(this.listQuery, { current: 1, size: 20 })
    },
    handleFilter() {
      this.listQuery.current = 1
      this.getList()
    },
    handleClick(val) {
      this.listQuery.orderStatus = val
      this.handleFilter()
    },
    handleCancel(row) {
      this.$confirm('是否取消订单?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        order.cancel(row.id).then(response => {
          this.$notify({
            title: '成功',
            message: '取消订单成功',
            type: 'success',
            duration: 2000
          })
          this.handleFilter()
        })
      })
    },
    handleSend(row) {
      this.sendData.id = row.id
      this.dialogSendVisible = true
    },
    handleSel(val) {
      const shipper = this.shipperOptions.find(e => e.value === val)
      this.sendData.shipperName = shipper.label
    },
    sendExpress() {
      this.confirmLoading = true
      order.send(this.sendData).then(response => {
        this.confirmLoading = false
        this.dialogSendVisible = false
        this.handleFilter()
      })
    }
  }
}
</script>
