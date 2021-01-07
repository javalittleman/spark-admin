<template>
  <div class="app-container">
    <div class="filter-container">
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
          <div>{{ scope.row.orderSn }}</div>
          <div>订单状态：<el-tag type="success">{{ scope.row.orderStatus | dictLabel('order_status') }}</el-tag></div>
          <div>发货状态:<el-tag type="success">{{ scope.row.shippingStatus | dictLabel('shipping_status') }}</el-tag></div>
          <div v-if="scope.row.refundStatus">退货状态:<el-tag type="success">{{ scope.row.refundStatus | dictLabel('refund_status') }}</el-tag></div>
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
        <template slot-scope="{row,$index}">
          <router-link :to="'/order/detail/'+row.id">
            <el-button type="text" size="mini" icon="el-icon-tickets" @click="handleInfo(row)">查看</el-button>
          </router-link>
          <el-button type="text" size="mini" style="color:red" icon="el-icon-delete" @click="handleDel(row,$index)">删除</el-button>
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
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import * as order from '@/api/shop/order/order.js'
import { resetData } from '@/utils'
import { getDictList } from '@/utils/dict'

export default {
  name: 'WxShopOrderTable',
  components: { Pagination },
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
      statusOptions: getDictList('order_status'),
      listQuery: {
        current: 1,
        size: 20,
        orderType: this.orderType,
        orderStatus: 0,
        orderSn: null
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
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
    }
  }
}
</script>
