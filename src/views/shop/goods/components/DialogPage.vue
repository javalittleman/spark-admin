<template>
  <div>
    <div v-show="showStatus" class="filter-container">
      <div class="form-group">
        <label class="control-label">商品编号:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.goodsSn" placeholder="商品编号" style="width: 200px;" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">商品标题:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.title" placeholder="商品标题" style="width: 200px;" />
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
      highlight-current-row
      element-loading-text="加载中"
      :header-cell-style="{background: '#f8f8f9'}"
      border
      @current-change="handleCurrentChange"
    >
      <el-table-column label="商品编号" prop="goodsSn" />
      <el-table-column label="首页图片" prop="homePic">
        <template slot-scope="scope">
          <el-image v-if="scope.row.homePic" style="width: 60px; height: 60px" :src="scope.row.homePic" :preview-src-list="[scope.row.homePic]" />
        </template>
      </el-table-column>
      <el-table-column label="商品标题" prop="title" show-overflow-tooltip />
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
import * as goods from '@/api/shop/goods/goods.js'
import { resetData } from '@/utils'

export default {
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      showStatus: true,
      selRow: null,
      listQuery: {
        current: 1,
        size: 20,
        goodsSn: null,
        title: null
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      goods.page(this.listQuery).then(response => {
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
    handleCurrentChange(val) {
      this.selRow = val
    }
  }
}
</script>
