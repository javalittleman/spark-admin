<template>
  <div class="app-container">
    <div v-show="showStatus" class="filter-container">
      <div class="form-group">
        <label class="control-label">appId:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.appId" placeholder="appId" style="width: 200px;" />
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
      <el-table-column label="appID" prop="appId" />
      <el-table-column label="secret" prop="secret" />
      <el-table-column label="客户端" prop="clientId" />
      <el-table-column label="备注" prop="remarks" />
      <el-table-column label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.createDate | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="hasPerm('shop:auth:edit')" type="text" size="mini" icon="el-icon-edit" @click="handleUpdate(row)">编辑</el-button>
          <el-button v-if="hasPerm('shop:auth:del')" type="text" size="mini" style="color:red" icon="el-icon-circle-close" @click="handleModifyStatus(row, 1)">删除</el-button>
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="formData"
        label-position="right"
        label-width="100px"
        style="margin-left:10px;"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="appId" prop="appId">
              <el-input v-model="formData.appId" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="secret" prop="secret">
              <el-input v-model="formData.secret" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="客户端ID" prop="clientId">
          <el-select v-model="formData.clientId" placeholder="选择客户端" style="width:100%">
            <el-option v-for="item in oauth2Options" :key="item.label" :label="item.label" :value="item.label" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="formData.remarks"
            :autosize="{ minRows: 2, maxRows: 4}"
            type="textarea"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button icon="el-icon-close" @click="dialogFormVisible = false">取消</el-button>
        <el-button
          icon="el-icon-check"
          :loading="confirmLoading"
          type="primary"
          @click="saveOrUpdate()"
        >确定</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import * as auth from '@/api/shop/auth.js'
import { select } from '@/api/sys/oauth.js'
import { resetData } from '@/utils'

export default {
  name: 'WxShopAuth',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      showStatus: true,
      confirmLoading: false,
      dialogFormVisible: false,
      textMap: {
        update: '编辑',
        create: '创建'
      },
      dialogStatus: '',
      listQuery: {
        current: 1,
        size: 20,
        appId: null
      },
      oauth2Options: [],
      formData: {
        id: null,
        appId: null,
        secret: null,
        clientId: null,
        remarks: null
      },
      rules: {
        appId: [
          { required: true, message: '请输入appId', trigger: 'change' }
        ],
        secret: [
          { required: true, message: '请输入secret', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.getOauth2()
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      auth.page(this.listQuery).then(response => {
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
    getOauth2() {
      select().then(response => {
        this.oauth2Options = response.data
      })
    },
    reset() {
      resetData(this.listQuery, { current: 1, size: 20 })
    },
    handleFilter() {
      this.listQuery.current = 1
      this.getList()
    },
    handleCreate() {
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
    saveOrUpdate() {
      // 新增Or编辑
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.confirmLoading = true
          auth.saveOrUpdate(this.formData)
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
