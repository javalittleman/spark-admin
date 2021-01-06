<template>
  <div>
    <div class="btn-header">
      <el-button v-loading="confirmLoading" style="margin-left: 10px;" icon="el-icon-check" type="warning" @click="saveGoods('0')">保存</el-button>
      <el-button v-loading="confirmLoading" type="success" icon="el-icon-shopping-bag-1" @click="saveGoods('1')">上架</el-button>
    </div>
    <div class="app-container">
      <el-form
        ref="dataForm"
        :rules="rules"
        :model="formData"
        label-position="right"
        label-suffix=":"
        label-width="200px"
        style="margin-left: 10px"
      >
        <el-tabs v-model="activeName" v-loading="infoLoading">
          <el-tab-pane label="基本信息" name="info">
            <el-form-item label="商品编号" prop="goodsSn">
              <el-input v-model="formData.goodsSn" style="max-width: 800px" />
            </el-form-item>
            <el-form-item label="商品标题" prop="title">
              <el-input
                v-model="formData.title"
                maxlength="64"
                style="max-width: 800px"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="商品关键词" prop="keywordsArg">
              <el-select v-model="formData.keywordsArg" multiple filterable allow-create default-first-option style="width: 400px">
                <el-option
                  v-for="item in keywordsOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="商品简介" prop="brief">
              <el-input
                v-model="formData.brief"
                type="textarea"
                maxlength="240"
                style="max-width: 800px"
                show-word-limit
              />
            </el-form-item>
            <el-form-item label="商品分类" prop="categoryIdsArg">
              <el-cascader ref="categoryIdRef" v-model="formData.categoryIdsArg" :props="cascadProps" :options="categoryTree" filterable style="width:400px" />
            </el-form-item>
            <el-form-item label="单位" prop="brief">
              <el-select
                v-model="formData.unit"
                clearable
                style="max-width: 800px"
              >
                <el-option
                  v-for="item in unitOptions"
                  :key="item.value"
                  :label="item.label + '(' + item.value + ')'"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="首页图">
              <el-upload
                :action="updateAction"
                :show-file-list="false"
                class="avatar-uploader"
                :on-success="uploadHomePicUrl"
                accept=".jpg,.jpeg,.png,.gif"
              >
                <img v-if="formData.homePic" :src="formData.homePic" class="avatar">
                <i v-else class="el-icon-plus avatar-uploader-icon" />
              </el-upload>
            </el-form-item>
            <el-form-item label="主图：">
              <el-upload
                :action="updateAction"
                list-type="picture-card"
                multiple
                :file-list="galleries"
                :on-exceed="uploadGalleryExceed"
                :on-remove="uploadGalleryRemove"
                :limit="6"
                :on-success="uploadGallerySuccess"
              >
                <i class="el-icon-plus" />
              </el-upload>
            </el-form-item>
            <el-form-item label="是否新品" prop="isNew">
              <el-switch v-model="formData.isNew" active-value="1" inactive-value="0" />
            </el-form-item>
            <el-form-item label="是否人气推荐" prop="isHot">
              <el-switch v-model="formData.isHot" active-value="1" inactive-value="0" />
            </el-form-item>
            <el-form-item label="零售价格" prop="retailPrice">
              <el-input v-model="formData.retailPrice" style="max-width: 300px">
                <template slot="append">￥</template>
              </el-input>
            </el-form-item>
            <el-form-item label="批发价格" prop="wholesalePrice">
              <el-input
                v-model="formData.wholesalePrice"
                style="max-width: 300px"
              >
                <template slot="append">￥</template>
              </el-input>
            </el-form-item>
            <el-form-item label="产品参数">
              <el-button type="primary" @click="handleParamsAdd">新增</el-button>
              <el-table
                :data="formData.shopGoodsParams"
                border
                :header-cell-style="{background: '#f8f8f9'}"
                style="width: 600px;margin-top:10px"
              >
                <el-table-column label="参数名">
                  <template slot-scope="scope">
                    <el-form-item :prop="'shopGoodsParams.' + scope.$index + '.paramName'" :rules="rules.paramName" label-width="0">
                      <el-input v-model="scope.row.paramName" placeholder="参数名" />
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="参数值">
                  <template slot-scope="scope">
                    <el-form-item :prop="'shopGoodsParams.' + scope.$index + '.paramValue'" :rules="rules.paramValue" label-width="0">
                      <el-input v-model="scope.row.paramValue" placeholder="参数值" />
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="140" class-name="small-padding fixed-width">
                  <template slot-scope="{row,$index}">
                    <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleParamsDel(row,$index)" />
                  </template>
                </el-table-column>
              </el-table>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="价格与库存" name="stock">
            <el-card class="box-card">
              <div slot="header" class="clearfix">
                <span>商品规格</span>
              </div>
              <el-form-item label="规格" prop="specsArg">
                <el-select v-model="formData.specsArg" style="width: 800px" multiple @change="handleSpeChange" @remove-tag="handleSpeRemoveTag">
                  <el-option
                    v-for="item in specsOptions"
                    :key="item.attrId.toString()"
                    :label="item.attrName"
                    :value="item.attrId.toString()"
                  />
                </el-select>
              </el-form-item>
              <div>
                <div v-for="(attr,i) in specsList" :key="i">
                  <el-form-item v-if="attr.attrType === 'list_box'" :label="attr.attrName">
                    <el-button type="primary" @click="handleAttrTableAdd(attr.attrId,i)">新增</el-button>
                    <el-table
                      size="mini"
                      :data="formData.shopGoodsAttrs[i].attrValList"
                      border
                      :header-cell-style="{background: '#f8f8f9'}"
                      style="margin-top:10px;width: 600px"
                    >
                      <el-table-column label="属性值" align="center">
                        <template slot-scope="{row,$index}">
                          <el-form-item prop="attrValId" label-width="0">
                            <el-select v-model="row.attrValId" @change="handleAttrSelChange($event,i,$index)">
                              <el-option
                                v-for="item in attr.attrVals"
                                :key="item.attrValId"
                                :label="item.attrVal"
                                :value="item.attrValId"
                              />
                            </el-select>
                          </el-form-item>
                        </template>
                      </el-table-column>
                      <el-table-column label="图片" align="center">
                        <template slot-scope="scope">
                          <el-image v-if="scope.row.pic" style="width: 60px; height: 60px" :src="scope.row.pic" :preview-src-list="[scope.row.pic]" />
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" align="center" width="140" class-name="small-padding fixed-width">
                        <template slot-scope="{row,$index}">
                          <el-button v-if="attr.isPic === '1'" type="warning" size="mini" icon="el-icon-picture-outline" @click="openAttrValDialog(i,$index)" />
                          <el-button type="danger" size="mini" icon="el-icon-delete" @click="handleAttrTableDel(row,i,$index)" />
                        </template>
                      </el-table-column>
                    </el-table>
                  </el-form-item>
                  <el-form-item v-else-if="attr.attrType === 'check_box'" :label="attr.attrName">
                    <el-checkbox-group v-model="formData.shopGoodsAttrs[i].attrChecks" @change="handleAttrCheckChange($event,i)">
                      <el-checkbox v-for="item in attr.attrVals" :key="item.attrValId" :label="item.attrValId">{{ item.attrVal }}</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </div>
              </div>

            </el-card>
            <el-card class="box-card" style="margin-top:10px">
              <div slot="header" class="clearfix">
                <span>商品库存(选择完规格后，请点击生成库存信息)</span>
                <el-button style="float: right;" type="primary" @click="handleBuildSku">生成库存</el-button>
              </div>
              <el-table
                :data="formData.shopGoodsSkus"
                border
                :header-cell-style="{background: '#f8f8f9'}"
                style="width: 100%"
              >
                <el-table-column prop="attrVals" label="属性搭配" />
                <el-table-column prop="attrValIds" label="属性搭配ID" />
                <el-table-column label="价格">
                  <template slot-scope="scope">
                    <el-form-item :prop="'shopGoodsSkus.' + scope.$index + '.price'" :rules="rules.price" label-width="0">
                      <el-input v-model="scope.row.price" placeholder="价格" />
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="库存">
                  <template slot-scope="scope">
                    <el-form-item :prop="'shopGoodsSkus.' + scope.$index + '.stock'" :rules="rules.stock" label-width="0">
                      <el-input v-model="scope.row.stock" placeholder="库存" />
                    </el-form-item>
                  </template>
                </el-table-column>
                <el-table-column label="商品编码">
                  <template slot-scope="scope">
                    <el-form-item prop="skuCode" label-width="0">
                      <el-input v-model="scope.row.skuCode" placeholder="商品编码" />
                    </el-form-item>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </el-tab-pane>
          <el-tab-pane label="详细描述" name="detail">
            <el-form-item label-width="0" prop="detail">
              <tinymce ref="editor" v-model="formData.detail" :img-upload-url="updateAction" :height="600" />
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <el-dialog title="上传图片" :visible.sync="dialogImgVisible" width="400px">
        <el-upload
          :action="updateAction"
          :show-file-list="false"
          class="avatar-uploader"
          :on-success="uploadSpecPicUrl"
          accept=".jpg,.jpeg,.png,.gif"
        >
          <img v-if="attrPicUrl" :src="attrPicUrl" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon" />
        </el-upload>
        <div slot="footer" class="dialog-footer">
          <el-button icon="el-icon-close" @click="dialogImgVisible = false">取消</el-button>
          <el-button
            icon="el-icon-check"
            type="primary"
            @click="saveAttrPicUrl()"
          >确定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import * as specs from '@/api/shop/specs.js'
import { getDictList } from '@/utils/dict'
import * as categoryApi from '@/api/shop/category.js'
import * as goodsApi from '@/api/shop/goods/goods.js'
import Tinymce from '@/components/Tinymce'

export default {
  name: 'WxShopGoodsCreate',
  components: { Tinymce },
  data() {
    return {
      activeName: 'info',
      updateAction: process.env.VUE_APP_BASE_API + '/wxshop/file/upload',
      confirmLoading: false,
      infoLoading: false,
      dialogImgVisible: false,
      dialogImgUrl: '',
      specsOptions: [],
      specsList: [],
      categoryTree: [],
      unitOptions: getDictList('goods_unit'),
      keywordsOptions: getDictList('goods_keywords'),
      cascadProps: {
        label: 'name',
        value: 'id'
      },
      attrPicUrl: '',
      attrPicIndex: 0,
      attrValPicIndex: 0,
      galleries: [],
      formData: {
        categoryNames: null,
        status: null,
        activity: 0,
        keywordsArg: [],
        categoryIdsArg: [],
        specsArg: [],
        shopGoodsGalleries: [],
        shopGoodsAttrs: [],
        shopGoodsSkus: [],
        shopGoodsParams: [],
        delParamIds: []
      },
      rules: {
        goodsSn: [{ required: true, message: '请输入商品编号', trigger: 'change' }],
        title: [{ required: true, message: '请输入标题', trigger: 'change' }],
        keywordsArg: [{ required: true, message: '请输入关键词', trigger: 'change' }],
        brief: [{ required: true, message: '请输入简介', trigger: 'change' }],
        categoryIdsArg: [{ required: true, message: '请选择分类', trigger: 'change' }],
        unit: [{ required: true, message: '请选择单位', trigger: 'change' }],
        homePic: [{ required: true, message: '请上传首页图', trigger: 'change' }],
        specsArg: [{ required: true, message: '请选择规格', trigger: 'change' }],
        detail: [{ required: true, message: '请填写商品详情', trigger: 'change' }],
        price: [{ required: true, message: '请输入价格', trigger: 'change' }],
        stock: [{ required: true, message: '请输入库存', trigger: 'change' }],
        paramName: [{ required: true, message: '请输入参数名', trigger: 'change' }],
        paramValue: [{ required: true, message: '请输入参数值', trigger: 'change' }]
      }
    }
  },
  created() {
    this.treeCategoryFun()
    this.listSpecsFun()
    if (this.$route.params && this.$route.params.id) {
      const id = this.$route.params.id
      this.fetchData(id)
    }
  },
  methods: {
    treeCategoryFun() {
      // 查询分类树
      categoryApi.list().then(response => {
        this.categoryTree = response.data
      })
    },
    listSpecsFun() {
      // 查询规格
      specs.list().then(response => {
        this.specsOptions = response.data
      })
    },
    fetchData(id) {
      this.infoLoading = true
      goodsApi.get(id).then(response => {
        this.formData = Object.assign({}, response.data)
        this.formData.delParamIds = []
        if (this.formData.shopGoodsGalleries) {
          this.formData.shopGoodsGalleries.forEach(g => {
            this.galleries.push({ url: g.url })
          })
        }
        // 属性值回显
        specs.getArray(this.formData.specs).then(response => {
          this.specsList = response.data
          this.specsList.forEach((s, i) => {
            if (s.attrType === 'check_box') {
              var attrChecks = []
              this.formData.shopGoodsAttrs[i].attrValList.forEach(a => {
                attrChecks.push(a.attrValId)
              })
              this.$set(this.formData.shopGoodsAttrs[i], 'attrChecks', attrChecks)
            }
          })
        })
        this.infoLoading = false
      })
    },
    handleSpeChange(val) {
      if (val.length !== 0) {
      // 选择规格后
        var selVal = val[val.length - 1]
        const speIndex = this.specsList.findIndex((v) => v.attrId === val)
        if (speIndex === -1) {
          specs.get(selVal).then(response => {
            var attr = Object.assign({}, response.data)
            this.specsList.push(attr)
            const attrIndex = this.formData.shopGoodsAttrs.findIndex((v) => v.attrId === attr.attrId)
            if (attrIndex === -1) {
              this.formData.shopGoodsAttrs.push(
                { attrId: attr.attrId, attrName: attr.attrName, attrValList: [], attrChecks: [] })
            } else if (attrIndex > -1 && attr.attrType === 'check_box') {
            // 处理check_box 选中问题
              var attrChecks = []
              this.formData.shopGoodsAttrs[attrIndex].attrValList.forEach(a => {
                attrChecks.push(a.attrValId)
              })
              this.$set(this.formData.shopGoodsAttrs[attrIndex], 'attrChecks', attrChecks)
            }
          })
        }
      }
    },
    handleSpeRemoveTag(val) {
      // 移除规格后
      var index = this.specsList.findIndex((v) => v.attrId === val)
      this.specsList.splice(index, 1)
      this.formData.shopGoodsAttrs.splice(index, 1)
    },
    handleAttrTableAdd(attrId, index) {
      // 属性表格增加选项
      this.formData.shopGoodsAttrs[index].attrValList.push({ attrId: attrId, attrValId: null, attrVal: null })
    },
    handleAttrTableDel(val, index, i) {
      // 属性表格删除事件
      this.formData.shopGoodsAttrs[index].attrValList.splice(i, 1)
    },
    handleAttrCheckChange(val, index) {
      // 属性中 check 不允许
      const attrValList = []
      this.specsList[index].attrVals.forEach(e => {
        if (val.indexOf(e.attrValId) > -1) {
          attrValList.push(e)
        }
      })
      this.formData.shopGoodsAttrs[index].attrValList = attrValList
    },
    handleAttrSelChange(val, index, i) {
      const attrValMode = this.specsList[index].attrVals.find(v => v.attrValId === val)
      this.formData.shopGoodsAttrs[index].attrValList[i].attrVal = attrValMode.attrVal
    },
    uploadHomePicUrl(res, file) {
      this.$set(this.formData, 'homePic', res.data)
    },
    uploadGallerySuccess(res, file) {
      this.formData.shopGoodsGalleries = this.formData.shopGoodsGalleries || []
      this.formData.shopGoodsGalleries.push({ name: file.name, url: res.data })
    },
    uploadGalleryExceed(files, fileList) {
      if (fileList.length >= 6) {
        this.$notify.error({
          title: '错误',
          message: `只允许上传6张主图`
        })
      }
    },
    uploadGalleryRemove(files, fileList) {
      const index = this.formData.shopGoodsGalleries.findIndex((v) => v.url === files.url)
      this.formData.shopGoodsGalleries.splice(index, 1)
    },
    openAttrValDialog(index, valIndex) {
      // 打开属性文件上传
      this.dialogImgVisible = true
      this.attrPicIndex = index
      this.attrValPicIndex = valIndex
    },
    saveAttrPicUrl() {
      this.$set(this.formData.shopGoodsAttrs[this.attrPicIndex].attrValList[this.attrValPicIndex], 'pic', this.attrPicUrl)
      this.dialogImgVisible = false
    },
    uploadSpecPicUrl(res, file) {
      this.attrPicUrl = res.data
    },
    handleBuildSku() {
      // 生成库存表
      const array = []
      const attrValsMap = new Map()
      this.formData.shopGoodsAttrs.forEach(a => {
        const items = []
        a.attrValList.forEach(b => {
          items.push(b.attrId + ':' + b.attrValId)
          attrValsMap.set(b.attrId + ':' + b.attrValId, b.attrVal)
        })
        array.push(items)
      })
      this.formData.shopGoodsSkus = []
      if (array.length === 1) {
        // 如果只有一个属性
        array[0].forEach(a => {
          this.formData.shopGoodsSkus.push({ attrValIds: a, attrVals: attrValsMap.get(a) })
        })
      } else {
      // 获取笛卡尔积之后的数据
        const deca = this.calcDescartes(array)
        deca.forEach(d => {
          var attrVals = []
          d.forEach(e => {
            attrVals.push(attrValsMap.get(e))
          })
          this.formData.shopGoodsSkus.push({ attrValIds: d.join(','), attrVals: attrVals.join(',') })
        })
      }
    },
    calcDescartes(array) {
    // 笛卡尔积计算
      if (array.length < 2) return array[0] || []
      return [].reduce.call(array, function(col, set) {
        var res = []
        col.forEach(function(c) {
          set.forEach(function(s) {
            var t = [].concat(Array.isArray(c) ? c : [c])
            t.push(s)
            res.push(t)
          })
        })
        return res
      })
    },
    handleParamsAdd() {
      // 产品属性添加
      this.formData.shopGoodsParams.push({})
    },
    handleParamsDel(row, index) {
      if (row.id) {
        this.formData.delParamIds.push(row.id)
      }
      this.formData.shopGoodsParams.splice(index, 1)
    },
    saveGoods(status) {
      // 保存商品信息
      if (this.formData.activity !== '0') {
        this.$notify({
          title: '校验信息',
          message: '当前产品在活动中，不允许编辑！',
          type: 'error',
          duration: 2000
        })
        return
      }
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.formData.status = status
          this.confirmLoading = true
          this.formData.categoryNames = this.$refs.categoryIdRef.getCheckedNodes(false)[0].pathLabels.join(',')
          goodsApi.save(this.formData).then(() => {
            this.confirmLoading = false
            this.$notify({
              title: '成功',
              message: '保存成功',
              type: 'success',
              duration: 2000
            })
            // 调用全局挂载的方法
            this.$store.dispatch('tagsView/delView', this.$route)
            // 返回上一步路由
            this.$router.go(-1)
          }).catch(() => {
            this.confirmLoading = false
          })
        } else {
          this.$notify.error({
            title: '错误',
            message: `页面有必填项，请填写必填项！`
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.btn-header {
  background: #d0d0d0;
  padding: 10px 10px;
  padding-right: 40px;
  text-align: right;
}
.app-container{
  padding-top: 2px;
}
</style>
