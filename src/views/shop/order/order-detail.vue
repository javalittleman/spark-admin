<template>
  <div class="app-container">
    <el-card class="box-card" style="margin-top:20px">
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
        <el-table-column prop="isFinish" label="是否完成" />
        <el-table-column label="更新时间">
          <template slot-scope="scope">
            <span>{{ scope.row.modifyDate | parseTime }} </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-card class="box-card" style="margin-top:20px">
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
    <el-card class="box-card" style="margin-top:20px">
      <div slot="header" class="clearfix">
        <span>资金信息</span>
      </div>
    </el-card>
  </div>
</template>

<script>

import * as order from '@/api/shop/order/order.js'

export default {
  name: 'WxShopOrderDetail',
  data() {
    return {
      formData: {
        goodsList: []
      }
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
      order.get(id).then(response => {
        this.formData = Object.assign({}, response.data)
      })
    }
  }
}
</script>
