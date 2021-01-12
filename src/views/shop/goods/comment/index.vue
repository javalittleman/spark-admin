<template>
  <div class="app-container">
    <div v-show="showStatus" class="filter-container">
      <div class="form-group">
        <label class="control-label">商品编号:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.goodsSn" placeholder="商品编号" style="width: 200px;" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">会员名:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.userName" placeholder="会员名" style="width: 200px;" />
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
      <el-table-column label="商品Id" prop="goodsId" />
      <el-table-column label="会员名" prop="userName" />
      <el-table-column label="内容" prop="content" />
      <el-table-column label="描述相符" prop="star">
        <template slot-scope="scope">
          <svg-icon v-for="n in +scope.row.star" :key="n" icon-class="star" class="meta-item__icon" style="color:#F7BA2A" />
        </template>
      </el-table-column>
      <el-table-column label="图片" prop="pic" />
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
import * as commentApi from '@/api/shop/goods/comment.js'
import { resetData } from '@/utils'

export default {
  name: 'WxShopGoodsComment',
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
        goodsTitle: null
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      commentApi.page(this.listQuery).then(response => {
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
