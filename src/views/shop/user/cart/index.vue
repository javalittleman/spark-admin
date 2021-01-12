<template>
  <div class="app-container">
    <div v-show="showStatus" class="filter-container">
      <div class="form-group">
        <label class="control-label">用户编号:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.userId" placeholder="用户编号" style="width: 200px;" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">商品ID:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.goodsId" style="width: 200px;" />
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
      <el-table-column label="用户编号" prop="userId" />
      <el-table-column label="商品信息">
        <template slot-scope="scope">
          <el-row>
            <el-col :span="8">
              <el-image style="width: 50px; height: 50px" :src="scope.row.homePic" fit="fit" />
            </el-col>
            <el-col :span="14">
              <div>{{ scope.row.goodsId }}</div>
              <div>{{ scope.row.goodsTitle }}</div>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column label="规格" prop="attrVals" />
      <el-table-column label="数量" prop="num" />
      <el-table-column label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.createDate | parseTime }}</span>
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
import * as cart from '@/api/shop/user/cart.js'
import { resetData } from '@/utils'

export default {
  name: 'WxShopCart',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      showStatus: true,
      createTimeArray: [],
      listQuery: {
        current: 1,
        size: 20,
        goodsId: null,
        userId: null
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      cart.page(this.listQuery).then(response => {
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
