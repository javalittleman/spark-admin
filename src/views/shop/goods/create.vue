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
          <el-form-item label="规格">
            <el-tag
              v-for="tag in keywords"
              :key="tag"
              size="medium"
              closable
              type="success"
              style="margin-left:10px"
              @close="handleClose(tag)"
            >
              {{ tag }}
            </el-tag>
            <el-input
              v-if="newKeywordVisible"
              ref="newKeywordInput"
              v-model="newKeyword"
              class="input-new-keyword"
              @keyup.enter.native="handleInputConfirm"
              @blur="handleInputConfirm"
            />
            <el-button v-else class="button-new-keyword" size="small" type="primary" @click="showInput">+ 增加</el-button>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品详情" name="detail">
          <el-form-item label="商品详细介绍">
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
      newKeywordVisible: false,
      newKeyword: '',
      dialogImgUrl: '',
      formData: {
        attrs: ''
      },
      keywords: [],
      rules: {}
    }
  },
  created() {},
  methods: {
    uploadSpecPicUrl: function(res, file) {
      this.formData.homePic = URL.createObjectURL(file.raw)
    },
    handleClose(tag) {
      // 删除可编辑标签
      this.keywords.splice(this.keywords.indexOf(tag), 1)
      this.formData.attrs = this.keywords.toString()
    },
    handleInputConfirm() {
      // 输入key
      const newKeyword = this.newKeyword
      if (newKeyword) {
        this.keywords.push(newKeyword)
        this.formData.attrs = this.keywords.toString()
      }
      this.newKeywordVisible = false
      this.newKeyword = ''
    },
    showInput() {
      // 显示
      this.newKeywordVisible = true
      this.$nextTick((_) => {
        this.$refs.newKeywordInput.$refs.input.focus()
      })
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
.input-new-keyword {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
  }
</style>
