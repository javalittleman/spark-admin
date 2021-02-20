<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.fullName" placeholder="区域名称" style="width: 200px;" class="filter-item" clearable />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        plain
        @click="getList"
      >查询</el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="tableData"
      style="width: 100%;margin-bottom: 20px;"
      :header-cell-style="{background: '#f8f8f9'}"
      row-key="id"
      border
      lazy
      :load="load"
      element-loading-text="加载中"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="id" label="区域编码" />
      <el-table-column prop="areaName" label="区域名称" />
      <el-table-column prop="areaType" label="区域类型">
        <template slot-scope="scope">
          <span>{{ scope.row.areaType | dictLabel('area_type') }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="treeNames" label="全节点名" />
      <el-table-column prop="sort" label="排序" />
    </el-table>
  </div>
</template>
<script>
import waves from '@/directive/waves' // waves directive
import * as areaApi from '@/api/sys/area.js'
import { getDictList } from '@/utils/dict'

export default {
  name: 'Area',
  directives: { waves },
  data() {
    return {
      listLoading: false,
      listQuery: {
        treeNames: null,
        parentId: null
      },
      tableData: [],
      deptTypeOptions: getDictList('area_type')
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      areaApi.list(this.listQuery).then(response => {
        this.tableData = response.data
        this.listLoading = false
      })
    },
    load(tree, treeNode, resolve) {
      this.listQuery.parentId = tree.id
      areaApi.list(this.listQuery).then(response => {
        resolve(response.data)
      })
    }
  }
}
</script>
