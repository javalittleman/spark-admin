<template>
  <div class="app-container">
    <div v-show="showStatus" class="filter-container">
      <div class="form-group">
        <label class="control-label">状态:</label>
        <div class="control-inline">
          <el-select v-model="listQuery.status" placeholder="状态" clearable style="width: 160px">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label+'('+item.value+')'" :value="item.value" />
          </el-select>
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
      <el-table-column label="图片" prop="imgUrl">
        <template slot-scope="scope">
          <el-image v-if="scope.row.imgUrl" style="width: 60px; height: 60px" :src="scope.row.imgUrl" :preview-src-list="[scope.row.imgUrl]" />
        </template>
      </el-table-column>
      <el-table-column label="类型" prop="type">
        <template slot-scope="scope">
          <span>{{ scope.row.type | dictLabel('swiper_type') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="sort" />
      <el-table-column label="状态" prop="status">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'"> {{ scope.row.status | dictLabel('status') }} </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建人" prop="creator" />
      <el-table-column label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.createDate | parseTime }}</span>
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="30%">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="formData"
        label-position="right"
        label-width="80px"
        label-suffix=":"
        style="margin-left:10px;"
      >
        <el-form-item label="图片" prop="imgUrl">
          <el-upload
            :action="updateAction"
            :show-file-list="false"
            class="avatar-uploader"
            :on-success="uploadPicUrl"
            accept=".jpg,.jpeg,.png,.gif"
          >
            <img v-if="formData.imgUrl" :src="formData.imgUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon" />
          </el-upload>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-radio-group v-model="formData.type">
            <el-radio v-for="item in typeOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
            <el-button v-if="formData.type === 'goods'" size="mini" @click="handleSelGoods">选择商品</el-button>
            <div v-if="formData.type === 'goods' && formData.goodsId" style="margin-top:10px"><el-tag type="success">{{ formData.goodsTitle }}</el-tag></div>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="1" label="排序" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio v-for="item in statusOptions" :key="item.value" :label="item.value">{{ item.label }}</el-radio>
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
import * as swiper from '@/api/shop/setting/swiper.js'
import { resetData } from '@/utils'
import { getDictList } from '@/utils/dict'

export default {
  name: 'WxShopSettingSwiper',
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
      updateAction: process.env.VUE_APP_BASE_API + '/file/api/upload?bucketName=shop&filePath=swiper',
      typeOptions: getDictList('swiper_type'),
      statusOptions: getDictList('status'),
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
      goodsData: [],
      formData: {
        id: null,
        imgUrl: null,
        type: 'none',
        goodsId: null,
        goodsTitle: null,
        sort: 0,
        status: '0'
      },
      rules: {
        imgUrl: [
          { required: true, message: '请上传轮播图', trigger: 'change' }
        ],
        type: [
          { required: true, message: '请选择类型', trigger: 'change' }
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
      swiper.page(this.listQuery).then(response => {
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
      this.$set(this.formData, 'imgUrl', res.data)
    },
    handleSelGoods() {
      this.dialogGoodsVisible = true
    },
    goodsSelConfirm() {
      const selRow = this.$refs['goodsTable'].selRow
      this.formData.goodsId = selRow.id
      this.formData.goodsTitle = selRow.title
      this.dialogGoodsVisible = false
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
          swiper.saveOrUpdate(this.formData)
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
