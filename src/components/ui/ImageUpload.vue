<script setup lang="ts">
import { ref } from 'vue'
import {
  IMAGE_ACCEPT_ATTR,
  readImageAsDataURL,
  validateImageFile,
} from '../../utils/image'

const props = defineProps<{ modelValue?: string; label?: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>()

const errorMsg = ref('')

async function onChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  errorMsg.value = ''

  const check = validateImageFile(file)
  if (!check.ok) {
    errorMsg.value = check.message || '文件格式不支持'
    return
  }
  try {
    emit('update:modelValue', await readImageAsDataURL(file))
  } catch (err) {
    errorMsg.value = err instanceof Error ? err.message : '图片读取失败'
  }
}

function clear() {
  emit('update:modelValue', '')
  errorMsg.value = ''
}
</script>

<template>
  <div class="image-upload">
    <div v-if="props.modelValue" class="preview">
      <img :src="props.modelValue" alt="预览" />
      <button type="button" class="remove" @click="clear">×</button>
    </div>
    <label v-else class="trigger">
      <span>📷 {{ props.label || '上传图片' }}</span>
      <input type="file" :accept="IMAGE_ACCEPT_ATTR" hidden @change="onChange" />
    </label>
    <p v-if="errorMsg" class="upload-error" role="alert">⚠️ {{ errorMsg }}</p>
  </div>
</template>

<style scoped>
.image-upload {
  display: inline-block;
}
.trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  transition: border-color 0.2s;
}
.trigger:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}
.preview {
  position: relative;
  width: 80px;
  height: 80px;
}
.preview img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.remove {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: var(--danger-color);
  color: #fff;
  cursor: pointer;
  line-height: 1;
}
.upload-error {
  display: block;
  margin-top: 6px;
  font-size: 13px;
  color: var(--danger-color);
  background: #fdecea;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  padding: 6px 10px;
  max-width: 260px;
}
</style>
