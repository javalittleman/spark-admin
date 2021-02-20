<template>
  <div class="app-container">
    <div v-show="showStatus" class="filter-container">
      <div class="form-group">
        <label class="control-label">名称:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.name" placeholder="名称" style="width: 200px;" />
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
        <el-button
          v-if="hasPerm('shop:auth:edit')"
          class="filter-item"
          style="margin-left: 10px;"
          type="success"
          icon="el-icon-edit"
          plain
          @click="handleCreate"
        >新增</el-button>
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
      <el-table-column label="秒杀名称" prop="name" />
      <el-table-column label="开始时间" prop="startTime" />
      <el-table-column label="结束时间" prop="endTime" />
      <el-table-column label="图片" prop="image">
        <template slot-scope="scope">
          <el-image v-if="scope.row.image" style="width: 40px; height: 40px" :src="scope.row.image" :preview-src-list="[scope.row.image]" />
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" />
      <el-table-column label="状态" prop="status">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.status" active-color="#13ce66" inactive-color="#ff4949" @change="updateStatus(scope.row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="140" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="text" size="mini" icon="el-icon-edit" @click="handleUpdate(row)">编辑</el-button>
          <el-button type="text" size="mini" style="color:red" icon="el-icon-delete" @click="handleDel(row,$index)">删除</el-button>
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="formData"
        label-position="right"
        label-width="100px"
        label-suffix=":"
        style="margin-left:10px;"
      >
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" label="名称" />
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <el-upload
            :action="updateAction"
            :show-file-list="false"
            class="avatar-uploader"
            :on-success="uploadPicUrl"
            accept=".jpg,.jpeg,.png,.gif"
          >
            <img v-if="formData.image" :src="formData.image" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-time-select v-model="formData.startTime" :picker-options="{ start: '08:00', step: '02:00', end: '20:00' }" placeholder="选择时间" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-time-select v-model="formData.endTime" :picker-options="{ start: '10:00', step: '02:00', end: '22:00' }" placeholder="选择时间" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="1" label="排序" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="formData.status" active-color="#13ce66" inactive-color="#ff4949" active-text="开启" inactive-text="关闭" />
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
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import * as seckill from '@/api/shop/marketing/seckill.js'
import { resetData } from '@/utils'

export default {
  name: 'WxShopSeckillManage',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      showStatus: true,
      dialogFormVisible: false,
      confirmLoading: false,
      updateAction: process.env.VUE_APP_BASE_API + '/file/api/upload?bucketName=shop&filePath=seckill',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      dialogStatus: '',
      listQuery: {
        current: 1,
        size: 20,
        status: null
      },
      formData: {
        id: null,
        name: null,
        startTime: null,
        endTime: null,
        image: null,
        sort: 0,
        status: false
      },
      rules: {
        name: [
          { required: true, message: '请输入优惠券名称', trigger: 'change' }
        ],
        startTime: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '请选择结束时间', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      seckill.page(this.listQuery).then(response => {
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
    uploadPicUrl(res, file) {
      this.$set(this.formData, 'image', res.data)
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
    updateStatus(row) {
      const updateData = { id: row.id, status: row.status }
      seckill.saveOrUpdate(updateData)
        .then(response => {
          this.$notify({
            title: '成功',
            message: '更新成功',
            type: 'success',
            duration: 2000
          })
          const index = this.list.findIndex(v => v.id === row.id)
          this.list.splice(index, 1, row)
        })
    },
    saveOrUpdate() {
      // 新增Or编辑
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.confirmLoading = true
          seckill.saveOrUpdate(this.formData)
            .then(response => {
              this.confirmLoading = false
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '创建成功',
                type: 'success',
                duration: 2000
              })
              this.getList()
            })
            .catch(() => {
              this.confirmLoading = false
            })
        }
      })
    }
  }
}
</script>
