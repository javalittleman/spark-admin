<template>
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
      <el-tabs v-model="activeName" type="border-card">
        <el-tab-pane label="基本信息" name="info">
          <el-form-item label="商品编号" prop="goods_sn">
            <el-input v-model="formData.goods_sn" style="max-width: 800px" />
          </el-form-item>
          <el-form-item label="商品标题" prop="title">
            <el-input
              v-model="formData.title"
              maxlength="120"
              style="max-width: 800px"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="商品分类" prop="title">
            <el-input
              v-model="formData.category_ids"
              style="max-width: 800px"
            />
          </el-form-item>
          <el-form-item label="商品关键词" prop="keywords">
            <el-input v-model="formData.keywords" style="max-width: 800px" />
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
              :on-success="uploadSpecPicUrl"
              accept=".jpg,.jpeg,.png,.gif"
            >
              <img v-if="formData.homePic" :src="formData.homePic" class="avatar">
              <i v-else class="el-icon-plus avatar-uploader-icon" />
            </el-upload>
          </el-form-item>
          <el-form-item label="是否新品" prop="isNew">
            <el-switch v-model="formData.isNew" />
          </el-form-item>
          <el-form-item label="是否人气推荐" prop="isHot">
            <el-switch v-model="formData.isHot" />
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
          <el-form-item label="推广佣金" prop="brokeragePrice">
            <el-input
              v-model="formData.brokeragePrice"
              style="max-width: 300px"
            >
              <template slot="append">￥</template>
            </el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="规格库存" name="stock">
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>商品规格</span>
              <el-button style="float: right;" type="primary" @click="handleSpecsAdd">新增</el-button>
            </div>
            <el-table
              :data="formData.specsTable"
              border
              :header-cell-style="{background: '#f8f8f9'}"
              style="width: 100%"
            >
              <el-table-column prop="attrName" label="规格名">
                <template slot-scope="scope">
                  <el-form-item prop="attrName" label-width="0">
                    <el-input v-model="scope.row.attrName" placeholder="规格名" />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column prop="attrName" label="规格值">
                <template slot-scope="scope">
                  <el-form-item prop="attrVal" label-width="0">
                    <el-input v-model="scope.row.attrVal" placeholder="规格名" />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column
                prop="pic"
                label="图片"
              />
              <el-table-column label="操作" align="center" width="140" class-name="small-padding fixed-width">
                <template slot-scope="{row,$index}">
                  <el-button type="danger" icon="el-icon-delete" @click="handleSpecsDel(row,$index)" />
                </template>
              </el-table-column>
            </el-table>
          </el-card>
          <el-card class="box-card" style="margin-top:10px">
            <div slot="header" class="clearfix">
              <span>商品库存</span>
            </div>
            <el-table
              :data="formData.skuTable"
              border
              :header-cell-style="{background: '#f8f8f9'}"
              style="width: 100%"
            >
              <el-table-column
                prop="attrName"
                label="规格属性"
              />
              <el-table-column
                prop="attrVals"
                label="属性搭配"
              />
              <el-table-column label="价格">
                <template slot-scope="scope">
                  <el-form-item prop="price" label-width="0">
                    <el-input v-model="scope.row.price" placeholder="价格" />
                  </el-form-item>
                </template>
              </el-table-column>
              <el-table-column label="库存">
                <template slot-scope="scope">
                  <el-form-item prop="stock" label-width="0">
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
        <el-tab-pane label="商品详情" name="detail">
          <el-form-item label-width="0">
            <tinymce ref="editor" v-model="formData.content" :height="400" />
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </div>
</template>

<script>
import { getDictList } from '@/utils/dict'
import Tinymce from '@/components/Tinymce'

export default {
  name: 'WxShopGoodsCreate',
  components: { Tinymce },
  data() {
    return {
      activeName: 'info',
      unitOptions: getDictList('goods_unit'),
      updateAction: 'https://jsonplaceholder.typicode.com/posts/',
      dialogImgVisible: false,
      dialogImgUrl: '',
      formData: {
        attrs: '',
        specsTable: [{}],
        skuTable: [{}]
      },
      rules: {}
    }
  },
  created() {},
  methods: {
    uploadSpecPicUrl: function(res, file) {
      this.formData.homePic = URL.createObjectURL(file.raw)
    },
    handleSpecsAdd() {
      this.formData.specsTable.unshift({})
    },
    handleSpecsDel(row, index) {
      this.formData.specsTable.splice(index, 1)
    }
  }
}
</script>

<style>
.avatar-uploader .el-upload {
  width: 145px;
  height: 145px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar-uploader .el-upload:hover {
  border-color: #20a0ff;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 120px;
  text-align: center;
}
.avatar {
  width: 145px;
  height: 145px;
  display: block;
}
</style>
