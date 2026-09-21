<script setup lang="ts">
import { ref } from 'vue'
import {
  IMAGE_ACCEPT_ATTR,
  readImageAsDataURL,
  validateImageFile,
} from '../../utils/image'

const props = defineProps<{
  modelValue: string[]
  label?: string
}>()
const emit = defineEmits<{ (e: 'update:modelValue', v: string[]): void }>()

const errorMsg = ref('')
const loading = ref(false)

async function onFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  input.value = ''
  if (!files || files.length === 0) return

  errorMsg.value = ''
  const added: string[] = []
  const failed: string[] = []

  for (const file of Array.from(files)) {
    const check = validateImageFile(file)
    if (!check.ok) {
      failed.push(check.message || '文件格式不支持')
      continue
    }
    try {
      loading.value = true
      added.push(await readImageAsDataURL(file))
    } catch (err) {
      failed.push(err instanceof Error ? err.message : '图片读取失败')
    } finally {
      loading.value = false
    }
  }

  if (failed.length) errorMsg.value = failed.join('；')
  if (added.length) emit('update:modelValue', [...props.modelValue, ...added])
}

function remove(index: number) {
  emit(
    'update:modelValue',
    props.modelValue.filter((_, i) => i !== index),
  )
  errorMsg.value = ''
}
</script>

<template>
  <div class="multi-upload">
    <div class="thumb-list">
      <div v-for="(img, i) in props.modelValue" :key="i" class="thumb-item">
        <img :src="img" alt="报告图片" />
        <button type="button" class="thumb-remove" aria-label="删除图片" @click="remove(i)">
          ×
        </button>
      </div>
      <label class="thumb-add">
        <span>{{ loading ? '上传中…' : '＋ 上传' }}</span>
        <input
          type="file"
          :accept="IMAGE_ACCEPT_ATTR"
          multiple
          hidden
          :disabled="loading"
          @change="onFiles"
        />
      </label>
    </div>
    <p class="upload-hint">{{ props.label || '支持 JPG / PNG / WEBP / GIF，单张不超过 10MB，可多选' }}</p>
    <p v-if="errorMsg" class="upload-error" role="alert">⚠️ {{ errorMsg }}</p>
  </div>
</template>

<style scoped>
.thumb-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.thumb-item {
  position: relative;
}
.thumb-item img {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.thumb-remove {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: var(--danger-color);
  color: #fff;
  cursor: pointer;
  line-height: 1;
}
.thumb-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
  transition: border-color 0.2s, color 0.2s;
}
.thumb-add:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
}
.upload-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}
.upload-error {
  margin-top: 6px;
  font-size: 13px;
  color: var(--danger-color);
  background: #fdecea;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  padding: 6px 10px;
}
</style>
