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
    <div class="table-opts">
      <div class="table-opts-left">
        <router-link to="/shop/goods/create">
          <el-button
            v-if="hasPerm('shop:goods:add')"
            class="filter-item"
            style="margin-left: 10px;"
            type="success"
            icon="el-icon-edit"
            plain
          >新增</el-button>
        </router-link>
      </div>
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
      <el-table-column label="首页图片" prop="homePic">
        <template slot-scope="scope">
          <el-image v-if="scope.row.homePic" style="width: 60px; height: 60px" :src="scope.row.homePic" :preview-src-list="[scope.row.homePic]" />
        </template>
      </el-table-column>
      <el-table-column label="商品编号" prop="goodsSn" />
      <el-table-column label="商品标题" prop="title" show-overflow-tooltip />
      <el-table-column label="商品分类" prop="categoryIds" />
      <el-table-column label="商品关键词" prop="keywords" />
      <el-table-column label="单位">
        <template slot-scope="scope">
          <span>{{ scope.row.unit | dictLabel('goods_unit') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="价格信息">
        <template slot-scope="scope">
          <div>零售价格：{{ scope.row.retailPrice }}</div>
          <div>批发价格:{{ scope.row.wholesalePrice }}</div>
          <div>推广佣金:{{ scope.row.brokeragePrice }}</div>
        </template>
      </el-table-column>
      <el-table-column label="推荐信息">
        <template slot-scope="scope">
          <div>新品：{{ scope.row.isNew | dictLabel('yes_no') }}</div>
          <div>人气推荐:{{ scope.row.isHot | dictLabel('yes_no') }}</div>
        </template>
      </el-table-column>
      <el-table-column label="创建信息">
        <template slot-scope="scope">
          <div>{{ scope.row.creator }}</div>
          <div>{{ scope.row.createDate | parseTime }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <router-link :to="{path:'/shop/goods/create/',query:{id:row.id}}">
            <el-button v-if="hasPerm('shop:goods:edit')" size="mini" type="text" icon="el-icon-edit">编辑</el-button>
          </router-link>
          <el-button v-if="hasPerm('shop:goods:del')" type="text" size="mini" style="color:red" icon="el-icon-delete" @click="handleDelete(row)">删除</el-button>
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
import * as goods from '@/api/shop/goods/goods.js'
import { resetData } from '@/utils'

export default {
  name: 'WxShopGoods',
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
    }
  }
}
</script>
