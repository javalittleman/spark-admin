<template>
  <div class="app-container">
    <div v-show="showStatus" class="filter-container">
      <div class="form-group">
        <label class="control-label">商品名称:</label>
        <div class="control-inline">
          <el-input v-model="listQuery.goodsTitle" placeholder="商品名称" style="width: 200px;" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">开始时间:</label>
        <div class="control-inline">
          <el-date-picker v-model="listQuery.startTime" type="datetime" />
        </div>
      </div>
      <div class="form-group">
        <label class="control-label">结束时间:</label>
        <div class="control-inline">
          <el-date-picker v-model="listQuery.endTime" type="datetime" />
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
      <el-table-column label="商品图片" prop="homePic">
        <template slot-scope="scope">
          <el-image v-if="scope.row.homePic" style="width: 40px; height: 40px" :src="scope.row.homePic" :preview-src-list="[scope.row.homePic]" />
        </template>
      </el-table-column>
      <el-table-column label="商品标题" prop="goodsTitle" width="300" />
      <el-table-column label="商品原价" prop="minPrice" />
      <el-table-column label="秒杀价格" prop="price" />
      <el-table-column label="秒杀销量" prop="sales" />
      <el-table-column label="开始时间" prop="startTime">
        <template slot-scope="scope">
          <span>{{ scope.row.startTime | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" prop="endTime">
        <template slot-scope="scope">
          <span>{{ scope.row.endTime | parseTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否限购" prop="quota">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.isQuota" type="success"> 是</el-tag>
          <el-tag v-else type="info"> 否</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="限购总数" prop="quota" />
      <el-table-column label="操作" align="center" width="140" class-name="small-padding fixed-width">
        <template slot-scope="{row,$index}">
          <el-button type="text" size="mini" icon="el-icon-edit" @click="handleUpdate(row)">编辑</el-button>
          <el-button type="text" size="mini" style="color:red" icon="el-icon-delete" @click="handleDelete(row,$index)">删除</el-button>
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
        <el-form-item label="选择商品" prop="goodsId">
          <el-radio-group v-model="formData.goodsId">
            <el-tag v-if="formData.goodsId" type="success">{{ formData.goodsTitle }}</el-tag>
            <el-button v-if="formData.id === null" type="primary" size="mini" style="margin-left:10px" @click="handleSelGoods">选择商品</el-button>
          </el-radio-group>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="开始时间" prop="startTime">
              <el-date-picker v-model="formData.startTime" type="datetime" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" prop="endTime">
              <el-date-picker v-model="formData.endTime" type="datetime" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否限购" prop="isQuota">
              <el-switch v-model="formData.isQuota" active-color="#13ce66" inactive-color="#ff4949" active-text="是" inactive-text="否" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="formData.isQuota" label="限购数量" prop="quota">
              <el-input-number v-model="formData.quota" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">商品SKU</el-divider>
        <el-table
          :data="formData.goodsSkus"
          border
          :header-cell-style="{background: '#f8f8f9'}"
          style="width: 100%"
        >
          <el-table-column label="属性搭配" prop="attrVals" />
          <el-table-column prop="attrValIds" label="属性搭配ID" />
          <el-table-column label="秒杀价格">
            <template slot-scope="scope">
              <el-form-item label-width="0">
                <el-input-number v-model="scope.row.activityPrice" :precision="2" :step="0.1" />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="价格" prop="price" />
          <el-table-column label="库存" prop="stock" />
          <el-table-column label="商品编码" prop="skuCode" />
        </el-table>
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

    <el-dialog title="选择商品" :visible.sync="dialogGoodsVisible">
      <dialog-page ref="goodsTable" />
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogGoodsVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="goodsSelConfirm">
          确定
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'
import DialogPage from '@/views/shop/goods/components/DialogPage'
import { getSkus } from '@/api/shop/goods/goods.js'
import * as seckillGoods from '@/api/shop/marketing/seckillGoods.js'
import { resetData } from '@/utils'

export default {
  name: 'WxShopSeckillManage',
  components: { Pagination, DialogPage },
  directives: { waves },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      showStatus: true,
      dialogFormVisible: false,
      dialogGoodsVisible: false,
      confirmLoading: false,
      textMap: {
        update: '编辑',
        create: '创建'
      },
      dialogStatus: '',
      listQuery: {
        current: 1,
        size: 20,
        goodsTitle: null,
        startTime: null,
        endTime: null
      },
      formData: {
        id: null,
        goodsId: null,
        goodsTitle: null,
        startTime: null,
        endTime: null,
        isQuota: false,
        quota: 0,
        goodsSkus: []
      },
      rules: {
        goodsId: [
          { required: true, message: '请选择商品', trigger: 'change' }
        ],
        startTime: [
          { required: true, message: '请选择开始时间', trigger: 'change' }
        ],
        endTime: [
          { required: true, message: '请选择结束时间', trigger: 'change' }
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
      seckillGoods.page(this.listQuery).then(response => {
        this.list = response.data.records
        this.total = response.data.total
        this.listQuery.current = response.data.current
        this.listQuery.size = response.data.size
        this.listLoading = false
      })
    },
    getGoodsSku(goodsId) {
      // 获取商品的sku
      getSkus(goodsId).then(response => {
        this.$set(this.formData, 'goodsSkus', response.data)
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
    handleSelGoods() {
      this.dialogGoodsVisible = true
    },
    goodsSelConfirm() {
      const selRow = this.$refs['goodsTable'].selRow
      if (selRow.activity !== '0') {
        this.$notify({
          title: '校验信息',
          message: '只允许选择活动状态是正常的！',
          type: 'error',
          duration: 2000
        })
        return
      }
      this.formData.goodsId = selRow.id
      this.formData.goodsTitle = selRow.title
      this.getGoodsSku(selRow.id)
      this.dialogGoodsVisible = false
    },
    handleCreate() {
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      resetData(this.formData)
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleUpdate(row) {
      this.formData = Object.assign({}, row)
      this.getGoodsSku(this.formData.goodsId)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleDelete(row, index) {
      this.$confirm('是否删除数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        seckillGoods.del(row.id).then(response => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.list.splice(index, 1)
        })
      })
    },
    saveOrUpdate() {
      // 新增Or编辑
      this.$refs['dataForm'].validate(valid => {
        if (valid) {
          this.confirmLoading = true
          seckillGoods.saveOrUpdate(this.formData)
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
