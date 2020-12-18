<template>
  <div class="app-container">
    <div v-show="showStatus" class="filter-container">
      <div class="form-group">
        <label class="control-label">用户编号:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.id" placeholder="用户编号" style="width: 200px;" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">昵称:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.nickname" placeholder="昵称" style="width: 200px;" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">微信OpenId:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.wxOpenid" placeholder="微信OpenId" style="width: 200px;" />
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
      <el-table-column label="编号" prop="id" width="80" />
      <el-table-column label="头像" align="center" width="100">
        <template slot-scope="scope">
          <el-avatar :src="scope.row.avatar" />
        </template>
      </el-table-column>
      <el-table-column label="用户名" prop="username" />
      <el-table-column label="昵称" prop="nickname" />
      <el-table-column label="性别" prop="gender">
        <template slot-scope="scope">
          <span>{{ scope.row.userType | dictLabel('sex') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="手机号" prop="mobile" />
      <el-table-column label="类型">
        <template slot-scope="scope">
          <span>{{ scope.row.userType | dictLabel('shop_user_type') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <span>{{ scope.row.status | dictLabel('shop_user_status') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="最近登录IP" prop="lastLoginIp" />
      <el-table-column label="最后登录时间" width="140">
        <template slot-scope="scope">
          <span>{{ scope.row.lastLoginTime | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.createDate | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-if="row.status !== 1" type="text" size="mini" style="color:red" icon="el-icon-circle-close" @click="handleModifyStatus(row, 1)">禁用</el-button>
          <el-button v-if="row.status === 1" type="text" size="mini" style="color:green" icon="el-icon-circle-close" @click="handleModifyStatus(row, 0)">正常</el-button>
          <el-button type="text" size="mini" icon="el-icon-paperclip" @click="handleDetail(row)">详情</el-button>
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
    <el-dialog title="用户详情" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :model="formData" label-position="right" label-width="100px" style="margin-left:10px;">
        <el-row>
          <el-col :span="8">
            <el-image style="width: 100px; height: 100px" :src="formData.avatar" fit="fill" />
          </el-col>
          <el-col :span="16">
            <el-form-item label="用户名">
              {{ formData.username }}
              <el-tag type="success">{{ formData.userType | dictLabel('shop_user_type') }}</el-tag>
            </el-form-item>
            <el-form-item label="昵称">
              {{ formData.nickname }}
            </el-form-item>
            <el-form-item label="微信OpenId">
              {{ formData.wxOpenid }}
            </el-form-item>
            <el-form-item label="最近登录信息">
              IP：{{ formData.lastLoginIp }} 时间：{{ formData.lastLoginTime | parseTime }}
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">其他信息</el-divider>
        <el-tabs v-model="activeName">
          <el-tab-pane label="收货地址" name="address">
            <el-table :data="addTableData" style="width: 100%">
              <el-table-column label="收货人">
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.isDefault === '1'" type="warning">[默认]</el-tag><span> {{ scope.row.name }}</span>
                </template>
              </el-table-column>
              <el-table-column label="手机号" prop="mobile" />
              <el-table-column label="具体收货地址" prop="address" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="我的收藏" name="collect">
            <el-table :data="collTableData" style="width: 100%">
              <el-table-column label="商品编号" prop="goodsSn" />
              <el-table-column label="创建时间">
                <template slot-scope="scope">
                  <span>{{ scope.row.createDate | parseTime }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="浏览记录" name="footprint">
            <el-table :data="footTableData" style="width: 100%">
              <el-table-column label="商品编号" prop="goodsSn" />
              <el-table-column label="创建时间">
                <template slot-scope="scope">
                  <span>{{ scope.row.createDate | parseTime }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
import * as user from '@/api/shop/user/user.js'
import * as address from '@/api/shop/user/address.js'
import * as collect from '@/api/shop/user/collect.js'
import * as footprint from '@/api/shop/user/footprint.js'
import { resetData } from '@/utils'

export default {
  name: 'WxShopUser',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      showStatus: true,
      dialogFormVisible: false,
      formData: {
        avatar: ''
      },
      addTableData: null,
      collTableData: null,
      footTableData: null,
      activeName: 'address',
      createTimeArray: [],
      listQuery: {
        current: 1,
        size: 20,
        nickname: null,
        wxOpenid: null
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      user.page(this.listQuery).then(response => {
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
    handleDetail(row) {
      this.formData = Object.assign({}, row)
      this.dialogFormVisible = true
      // 查询用户地址
      address.page({ userId: row.id }).then(response => {
        this.addTableData = response.data.records
      })
      // 查询收藏
      collect.page({ userId: row.id }).then(response => {
        this.collTableData = response.data.records
      })
      // 查询足迹
      footprint.page({ userId: row.id }).then(response => {
        this.footTableData = response.data.records
      })
    },
    handleModifyStatus(row, status) {
      this.$confirm('是否确认此操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        user.updateStatus(row.id, status).then(response => {
          this.$notify({
            title: '成功',
            message: '操作成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      })
    }
  }
}
</script>
