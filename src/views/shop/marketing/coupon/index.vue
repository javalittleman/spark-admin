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
      <el-table-column label="优惠券名称" prop="name" />
      <el-table-column label="类型" prop="couponType">
        <template slot-scope="scope">
          <span>{{ scope.row.couponType | dictLabel('coupon_type') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="面额" prop="denomination" />
      <el-table-column label="固定面额" prop="fixedDenomination" />
      <el-table-column label="开始时间" prop="startTime" />
      <el-table-column label="结束时间" prop="endTime" />
      <el-table-column label="发放总数" prop="total" />
      <el-table-column label="剩余总量" prop="lastTotal" />
      <el-table-column label="状态" prop="status">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter"> {{ scope.row.status | dictLabel('coupon_status') }} </el-tag>
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="40%">
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
        <el-form-item label="类型" prop="couponType">
          <el-radio-group v-model="formData.couponType">
            <el-radio v-for="item in typeOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="面额" prop="denomination">
          <el-input-number v-model="formData.denomination" />
          <el-tooltip class="item" effect="dark" content="优惠多少钱和打多少折" placement="top-start">
            <i class="el-icon-info" />
          </el-tooltip>
        </el-form-item>
        <el-form-item v-if="formData.couponType === 'fullRed'" label="固定面额" prop="fixedDenomination">
          <el-input-number v-model="formData.fixedDenomination" :min="1" label="大于多少开始优惠" />
          <el-tooltip class="item" effect="dark" content="大于多少开始优惠" placement="top-start">
            <i class="el-icon-info" />
          </el-tooltip>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker v-model="formData.startTime" align="right" type="date" placeholder="开始时间" />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker v-model="formData.endTime" align="right" type="date" placeholder="结束时间" />
        </el-form-item>
        <el-form-item label="是否限量" prop="isLimited">
          <el-switch v-model="formData.isLimited" active-text="限量" inactive-text="不限量" />
        </el-form-item>
        <el-form-item v-if="formData.isLimited" label="总数" prop="total">
          <el-input-number v-model="formData.total" :min="1" label="总数" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio v-for="item in statusOptions" :key="Number(item.value)" :label="Number(item.value)" border>{{ item.label }}</el-radio>
          </el-radio-group>
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
import * as coupon from '@/api/shop/marketing/coupon.js'
import { resetData } from '@/utils'
import { getDictList } from '@/utils/dict'

export default {
  name: 'WxShopCoupon',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        0: 'info',
        1: 'success',
        2: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      showStatus: true,
      dialogFormVisible: false,
      confirmLoading: false,
      typeOptions: getDictList('coupon_type'),
      statusOptions: getDictList('coupon_status'),
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
        couponType: null,
        denomination: 0,
        fixedDenomination: 0,
        startTime: null,
        endTime: null,
        isLimited: false,
        total: 0,
        lastTotal: 0,
        status: 0
      },
      rules: {
        name: [
          { required: true, message: '请输入优惠券名称', trigger: 'change' }
        ],
        couponType: [
          { required: true, message: '请选择类型', trigger: 'change' }
        ],
        denomination: [
          { required: true, message: '请输入金额', trigger: 'change' }
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
      coupon.page(this.listQuery).then(response => {
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
    saveOrUpdate() {
      // 新增Or编辑
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.confirmLoading = true
          coupon.saveOrUpdate(this.formData)
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
