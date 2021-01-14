<template>
  <div class="app-container">
    <el-card class="box-card" style="margin-top:10px">
      <div slot="header" class="clearfix">
        <span><el-tag type="warning">[{{ formData.orderType | dictLabel('goods_activity') }}]</el-tag> 的订单状态 </span>
      </div>
      <el-steps :active="stepsActive" finish-status="success" process-status="info" :align-center="true">
        <el-step title="买家下单" :description="formData.createDate | parseTime" />
        <el-step title="买家付款" :description="formData.payTime | parseTime" />
        <el-step title="卖家发货" :description="formData.sendTime | parseTime" />
        <el-step title="交易完成" :description="formData.completeTime | parseTime" />
      </el-steps>
    </el-card>
    <el-card class="box-card" style="margin-top:10px">
      <div slot="header" class="clearfix">
        <span>物流信息</span>
      </div>
      <el-table :data="formData.expressList" style="width: 100%" :header-cell-style="{background: '#f8f8f9'}">
        <el-table-column label="发货时间">
          <template slot-scope="scope">
            <span>{{ scope.row.createDate | parseTime }} </span>
          </template>
        </el-table-column>
        <el-table-column prop="shipperName" label="物流公司" />
        <el-table-column prop="logisticCode" label="快递单号" />
        <el-table-column prop="traces" label="物流状态" />
        <el-table-column prop="isFinish" label="是否完成">
          <template slot-scope="scope">
            <el-tag type="success">{{ scope.row.isFinish ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="更新时间">
          <template slot-scope="scope">
            <span>{{ scope.row.modifyDate | parseTime }} </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template slot-scope="{row}">
            <el-button type="text" size="mini" icon="el-icon-tickets" @click="findTraces(row)">物流轨迹</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card class="box-card" style="margin-top:10px">
      <div slot="header" class="clearfix">
        <span>订单详情</span>
      </div>
      <el-row>
        <el-col :span="8">
          <h4>订单编号</h4>
          <p>{{ formData.orderSn }}</p>
          <h4>买家（ID：{{ formData.userId }}）</h4>
          <p>{{ formData.user.nickname }}</p>
          <p>手机号: {{ formData.user.mobile }}</p>
        </el-col>
        <el-col :span="8">
          <h4>订单备注</h4>
          <p>用户备注：{{ formData.userRemarks }}</p>
          <p>备注：{{ formData.remarks }}</p>
          <h4>收货地址</h4>
          <p>收件人名称：{{ formData.consignee }}</p>
          <p>地址：{{ formData.province }} {{ formData.city }} {{ formData.district }} {{ formData.address }}</p>
          <p>手机号：{{ formData.mobile }}</p>
        </el-col>
      </el-row>
      <el-table :data="formData.goodsList" style="width: 100%" :header-cell-style="{background: '#f8f8f9'}">
        <el-table-column label="商品信息">
          <template slot-scope="scope">
            <el-row>
              <el-col :span="8">
                <el-image style="width: 50px; height: 50px" :src="scope.row.picUrl" fit="fit" />
              </el-col>
              <el-col :span="14">
                <div>{{ scope.row.goodsTitle }}</div>
                <div>{{ scope.row.goodsAttrVals }}({{ scope.row.goodsAttrValIds }} )</div>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="单价" width="160" />
        <el-table-column prop="number" label="数量" width="160" />
        <el-table-column prop="totalAmount" label="商品总额" width="160" />
      </el-table>
    </el-card>
    <el-card class="box-card" style="margin-top:10px">
      <div slot="header" class="clearfix">
        <span>资金信息</span>
      </div>
      <h4>订单金额</h4>
      <el-table :data="amountData" style="width: 100%" :header-cell-style="{background: '#f8f8f9'}">
        <el-table-column prop="goodsPrice" label="商品总价" />
        <el-table-column prop="orderPrice" label="订单总价" />
        <el-table-column prop="shippingFee" label="运费" />
        <el-table-column prop="freightPrice" label="配送费用" />
        <el-table-column prop="couponPrice" label="优惠券价格" />
        <el-table-column prop="actualPrice" label="实际支付的金额" />
      </el-table>
      <h4>支付信息</h4>
      <p>{{ formData.payName }}</p>
    </el-card>
    <el-dialog title="物流轨迹信息" :visible.sync="dialogVisible">
      <el-timeline :reverse="false">
        <el-timeline-item
          v-for="(activity, index) in activities"
          :key="index"
          :timestamp="activity.uploadTime"
        >
          {{ activity.content }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>

import * as order from '@/api/shop/order/order.js'

export default {
  name: 'WxShopOrderDetail',
  data() {
    return {
      stepsActive: 1,
      completeData: '',
      dialogVisible: false,
      activities: [],
      formData: {
        user: {
          nickname: ''
        },
        goodsList: []
      },
      amountData: []
    }
  },
  created() {
    if (this.$route.params && this.$route.params.id) {
      const id = this.$route.params.id
      this.fetchData(id)
    }
  },
  methods: {
    fetchData(id) {
      const loading = this.$loading({
        lock: true,
        text: '加载中....',
        spinner: 'el-icon-loading',
        target: document.querySelector('.app-container')
      })
      order.get(id).then(response => {
        this.formData = Object.assign({}, response.data)
        // 拼接订单金额表格
        const { goodsPrice, orderPrice, couponPrice, actualPrice, shippingFee, freightPrice } = this.formData
        this.amountData.push({
          goodsPrice: goodsPrice,
          orderPrice: orderPrice,
          couponPrice: couponPrice,
          actualPrice: actualPrice,
          shippingFee: shippingFee,
          freightPrice: freightPrice
        })
        if (this.formData.orderStatus < 2) {
          this.stepsActive = 1
        } else if (this.formData.orderStatus > 3) {
          this.stepsActive = 4
        } else {
          this.stepsActive = this.formData.orderStatus
        }
        loading.close()
      }).catch(() => {
        loading.close()
      })
    },
    findTraces(row) {
      // 物流轨迹信息
      order.trace(row.id).then(response => {
        this.activities = response.data
        this.dialogVisible = true
      })
    }
  }
}
</script>

<style lang="scss" scoped>
p{
  font-size: 13px;
}
</style>
