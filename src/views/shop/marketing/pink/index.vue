<template>
  <div class="app-container">
    <div v-show="showStatus" class="filter-container">
      <div class="form-group">
        <label class="control-label">主键:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.id" placeholder="主键" style="width: 200px;" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">用户ID:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.userId" placeholder="用户ID" style="width: 200px;" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">商品ID:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.goodsId" placeholder="商品ID" style="width: 200px;" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">商品标题:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.goodsTitle" placeholder="商品标题" style="width: 200px;" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">状态:</label>
        <div class="control-inline">
          <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 160px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label+'('+item.value+')'" :value="item.value" />
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
    >
      <el-table-column label="编号" prop="id" />
      <el-table-column label="订单IDs" prop="orderIds" />
      <el-table-column label="用户编号" prop="userId" />
      <el-table-column label="商品ID" prop="goodsId" />
      <el-table-column label="商品名称" prop="goodsTitle" />
      <el-table-column label="几人团" prop="people" />
      <el-table-column label="几人参加" prop="countPeople" />
      <el-table-column label="开始时间">
        <template slot-scope="scope">
          <span>{{ scope.row.startTime | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间">
        <template slot-scope="scope">
          <span>{{ scope.row.endTime | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">
            {{ scope.row.status | dictLabel('shop_pink_status') }}
          </el-tag>
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
import * as pink from '@/api/shop/marketing/pink.js'
import { resetData } from '@/utils'
import { getDictList } from '@/utils/dict'

export default {
  name: 'WxShopPinkUser',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        '0': 'info',
        '1': 'warning',
        '2': 'success',
        '3': 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      showStatus: true,
      statusOptions: getDictList('shop_pink_status'),
      listQuery: {
        current: 1,
        size: 20,
        id: null,
        userId: null,
        goodsId: null,
        goodsTitle: null,
        status: null
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      pink.page(this.listQuery).then(response => {
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
    }
  }
}
</script>
