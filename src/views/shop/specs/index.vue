<template>
  <div class="app-container">
    <div v-show="showStatus" class="filter-container">
      <div class="form-group">
        <label class="control-label">属性ID:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.attrId" placeholder="属性ID" style="width: 200px;" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">属性名称:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.attrName" placeholder="属性名称" style="width: 200px;" />
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
      <el-table-column label="属性ID" prop="attrId" />
      <el-table-column label="属性名称" prop="attrName" />
      <el-table-column label="组件类型">
        <template slot-scope="scope">
          <span>{{ scope.row.attrType | dictLabel('attr_type') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否上传图片">
        <template slot-scope="scope">
          <span>{{ scope.row.isPic | dictLabel('yes_no') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.createDate | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="140"
        class-name="small-padding fixed-width"
      >
        <template slot-scope="{row,$index}">
          <el-button
            type="text"
            size="mini"
            icon="el-icon-edit"
            @click="handleUpdate(row)"
          >编辑</el-button>
          <el-button
            type="text"
            size="mini"
            style="color:red"
            icon="el-icon-delete"
            @click="handleModifyStatus(row,$index)"
          >删除</el-button>
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
        <el-row>
          <el-col :span="12">
            <el-form-item label="属性名称" prop="attrName">
              <el-input v-model="formData.attrName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="组件类型" prop="attrType">
              <el-select
                v-model="formData.attrType"
                clearable
                style="width:100%"
              >
                <el-option
                  v-for="item in attrTypeOptions"
                  :key="item.value"
                  :label="item.label + '(' + item.value + ')'"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="上传图片" prop="isPic">
              <el-switch v-model="formData.isPic" active-value="1" inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="属性值">
          <el-button type="primary" @click="handleAttrValAdd">添加</el-button>
          <el-table
            :data="formData.attrVals"
            border
            :header-cell-style="{background: '#f8f8f9'}"
          >
            <el-table-column label="属性值*">
              <template slot-scope="scope">
                <el-form-item :prop="'attrVals.' + scope.$index + '.attrVal'" :rules="rules.attrVal" label-width="0">
                  <el-input v-model="scope.row.attrVal" placeholder="属性值" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="排序">
              <template slot-scope="scope">
                <el-form-item prop="sort" label-width="0">
                  <el-input-number v-model="scope.row.sort" :min="1" label="排序" />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="140" class-name="small-padding fixed-width">
              <template slot-scope="{row,$index}">
                <el-button type="danger" icon="el-icon-delete" @click="handleAttrValDel(row,$index)" />
              </template>
            </el-table-column>
          </el-table>
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
import * as specs from '@/api/shop/specs.js'
import { resetData } from '@/utils'
import { getDictList } from '@/utils/dict'

export default {
  name: 'WxShopSpecs',
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
      attrTypeOptions: getDictList('attr_type'),
      textMap: {
        update: '编辑',
        create: '创建'
      },
      dialogStatus: '',
      listQuery: {
        current: 1,
        size: 20,
        attrId: null,
        attrName: null
      },
      formData: {
        attrId: null,
        attrName: null,
        attrType: null,
        isPic: '0',
        attrVals: [{ sort: 1 }]
      },
      rules: {
        attrName: [
          { required: true, message: '请输入属性值', trigger: 'change' }
        ],
        attrType: [
          { required: true, message: '请输入属性类型', trigger: 'change' }
        ],
        attrVal: [
          { required: true, message: '请输入属性值', trigger: 'change' }
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
      specs.page(this.listQuery).then(response => {
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
    handleAttrValAdd() {
      const sort = this.formData.attrVals[this.formData.attrVals.length - 1].sort
      this.formData.attrVals.push({ sort: sort + 1 })
    },
    handleAttrValDel(row, index) {
      this.formData.attrVals.splice(index, 1)
    },
    handleCreate() {
      if (this.formData.attrId !== null) {
        resetData(this.formData, { isPic: '0', attrVals: [{ sort: 1 }] })
      }
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      specs.get(row.attrId).then(response => {
        this.formData = Object.assign({}, response.data)
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      })
    },
    saveOrUpdate() {
      // 新增Or编辑
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.confirmLoading = true
          specs.saveOrUpdate(this.formData)
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
