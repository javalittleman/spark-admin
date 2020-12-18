<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="分类名称" style="width: 200px;" class="filter-item" clearable />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        plain
        @click="getList"
      >查询</el-button>
      <el-button
        v-if="hasPerm('shop:category:edit')"
        class="filter-item"
        style="margin-left: 10px;"
        type="success"
        icon="el-icon-edit"
        plain
        @click="handleCreate"
      >新增</el-button>
      <el-button type="text" style="float:right" class="filter-item" @click="unfold">{{ expandText }}<i class="el-icon-edit" /></el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="tableData"
      style="width: 100%;margin-bottom: 20px;"
      :header-cell-style="{background: '#f8f8f9'}"
      row-key="id"
      border
      default-expand-all
      element-loading-text="加载中"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="id" label="编号" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="pic" label="分类图">
        <template slot-scope="scope">
          <el-image v-if="scope.row.pic" style="width: 60px; height: 60px" :src="scope.row.pic" :preview-src-list="[scope.row.pic]" />
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" />
      <el-table-column prop="createDate" label="创建时间" width="200">
        <template slot-scope="scope">
          <span>{{ scope.row.createDate | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="hasPerm('shop:category:edit')" type="text" size="mini" icon="el-icon-edit" @click="handleUpdate(row)">编辑</el-button>
          <el-button v-if="hasPerm('shop:category:del')" type="text" size="mini" icon="el-icon-delete" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
      <el-form ref="dataForm" :rules="rules" :model="formData" label-position="right" label-width="80px" style="margin-left:10px;">
        <el-row>
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="formData.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上级分类" prop="pid">
              <treeselect v-model="formData.pid" :normalizer="normalizer" :multiple="false" :options="treeData" clear-value-text="清除" placeholder=" " style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="formData.sort" :min="1" label="排序" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="分类图标">
          <el-upload
            :action="updateAction"
            :show-file-list="false"
            class="avatar-uploader"
            :on-success="uploadPicUrl"
            accept=".jpg,.jpeg,.png,.gif"
          >
            <img v-if="formData.pic" :src="formData.pic" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button :loading="confirmLoading" type="primary" @click="saveOrUpdate">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import waves from '@/directive/waves' // waves directive
import * as api from '@/api/shop/category.js'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { resetData } from '@/utils'

export default {
  name: 'Dept',
  directives: { waves },
  components: { Treeselect },
  data() {
    return {
      listLoading: false,
      confirmLoading: false,
      listQuery: {
        name: null
      },
      updateAction: process.env.VUE_APP_BASE_API + '/wxshop/file/upload',
      tableData: [],
      expandText: '展开全部',
      isShowTable: false,
      dialogFormVisible: false,
      dialogStatus: '',
      formData: {
        id: undefined,
        pid: null,
        name: null,
        pic: null,
        sort: 10
      },
      treeData: [{
        id: 0,
        name: '根目录',
        children: []
      }],
      textMap: {
        update: '编辑',
        create: '创建'
      },
      rules: {
        name: [{ required: true, message: '请输入名称', trigger: 'change' }],
        pid: [{ required: true, message: '请选择父节点', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      api.list(this.listQuery).then(response => {
        this.tableData = response.data
        // 树节点添加根目录
        this.treeData[0].children = response.data
        this.listLoading = false
      })
    },
    uploadPicUrl(res, file) {
      this.$set(this.formData, 'pic', res.data)
    },
    unfold() {
      // 展开
      this.$nextTick(function() {
        this.isShowTable = !this.isShowTable
        this.isShowTable ? this.expandText = '关闭全部' : this.expandText = '展开全部'
        this.expandAll()
      })
    },
    expandAll() {
      // 获取点击的箭头元素
      const els = document.getElementsByClassName('el-table__expand-icon')
      for (let i = 0; i < els.length; i++) {
        els[i].click()
      }
    },
    handleCreate() {
      resetData(this.formData)
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.formData = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row) {
      this.$confirm('是否删除数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        api.del(row.id).then(response => {
          this.getList()
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      })
    },
    saveOrUpdate() {
      // 新增or编辑
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.confirmLoading = true
          api.saveOrUpdate(this.formData).then(() => {
            this.confirmLoading = false
            this.dialogFormVisible = false
            this.getList()
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          }).catch(() => {
            this.confirmLoading = false
          })
        }
      })
    },
    normalizer(node) {
      // 修改tree数据形式
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.name,
        children: node.children
      }
    }
  }
}
</script>
