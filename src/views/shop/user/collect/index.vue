<template>
  <div class="app-container">
    <div v-show="showStatus" class="filter-container">
      <div class="form-group">
        <label class="control-label">用户编号:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.userId" style="width: 200px;" />
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
      <el-table-column label="商品ID" prop="goodsId" />
      <el-table-column label="商品图片" prop="homePic">
        <template slot-scope="scope">
          <el-image v-if="scope.row.homePic" style="width: 30px; height: 30px" :src="scope.row.homePic" :preview-src-list="[scope.row.homePic]" />
        </template>
      </el-table-column>
      <el-table-column label="商品名称" prop="goodsTitle" />
      <el-table-column label="价格" prop="price" />
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
import * as collect from '@/api/shop/user/collect.js'
import { resetData } from '@/utils'

export default {
  name: 'WxShopCollect',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      showStatus: true,
      listQuery: {
        current: 1,
        size: 20,
        userId: null,
        goodsId: null
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      collect.page(this.listQuery).then(response => {
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
