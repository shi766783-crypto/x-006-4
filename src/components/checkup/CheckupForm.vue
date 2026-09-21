<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useFamilyStore } from '../../stores/useFamilyStore'
import type { CheckupReport } from '../../types'
import { todayStr } from '../../utils/date'
import { fileToBase64, IMAGE_ACCEPT, validateImageFile } from '../../utils/image'

const emit = defineEmits<{
  (e: 'save', data: Omit<CheckupReport, 'id' | 'createdAt'>): void
  (e: 'close'): void
}>()

const store = useFamilyStore()

const form = reactive({
  memberId: store.state.members[0]?.id ?? '',
  examDate: todayStr(),
  hospital: '',
  conclusion: '',
  images: [] as string[],
})

const formError = ref('')
const uploadErrors = ref<string[]>([])

async function onFiles(event: Event) {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files) return
  const errors: string[] = []
  for (const file of Array.from(files)) {
    // Reject non-images / oversized files here so they never reach the
    // archive and render as blank broken images.
    const error = validateImageFile(file)
    if (error) {
      errors.push(error)
      continue
    }
    try {
      form.images.push(await fileToBase64(file))
    } catch {
      errors.push(`「${file.name}」读取失败，请重试`)
    }
  }
  uploadErrors.value = errors
  input.value = ''
}

function removeImage(index: number) {
  form.images.splice(index, 1)
}

function submit() {
  if (!form.memberId) {
    formError.value = '请选择家庭成员'
    return
  }
  if (!form.examDate) {
    formError.value = '请选择体检日期'
    return
  }
  if (!form.hospital.trim()) {
    formError.value = '请填写体检医院'
    return
  }
  if (!form.conclusion.trim()) {
    formError.value = '请填写关键结论'
    return
  }
  formError.value = ''
  emit('save', {
    memberId: form.memberId,
    examDate: form.examDate,
    hospital: form.hospital.trim(),
    conclusion: form.conclusion.trim(),
    images: [...form.images],
  })
}
</script>

<template>
  <div class="form-grid">
    <div class="form-group">
      <label class="form-label">家庭成员 *</label>
      <select v-model="form.memberId" class="input">
        <option v-for="m in store.state.members" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">体检日期 *</label>
      <input v-model="form.examDate" type="date" class="input" />
    </div>
    <div class="form-group span-2">
      <label class="form-label">体检医院 / 机构 *</label>
      <input v-model="form.hospital" class="input" placeholder="如：市第一人民医院体检中心" />
    </div>
    <div class="form-group span-2">
      <label class="form-label">关键结论 *</label>
      <textarea
        v-model="form.conclusion"
        class="input textarea"
        rows="3"
        placeholder="如：血脂偏高，建议复查；其余指标正常"
      ></textarea>
    </div>
    <div class="form-group span-2">
      <label class="form-label">报告照片（可多张，仅支持 JPG / PNG / WebP / GIF，单张不超过 5MB）</label>
      <div class="attach-list">
        <div v-for="(img, i) in form.images" :key="i" class="attach-item">
          <img :src="img" alt="" />
          <button type="button" class="attach-remove" @click="removeImage(i)">×</button>
        </div>
        <label class="attach-add">
          <span>＋ 上传</span>
          <input type="file" :accept="IMAGE_ACCEPT" multiple hidden @change="onFiles" />
        </label>
      </div>
      <ul v-if="uploadErrors.length" class="upload-errors">
        <li v-for="(err, i) in uploadErrors" :key="i">⚠️ {{ err }}</li>
      </ul>
    </div>
  </div>
  <p v-if="formError" class="form-error">{{ formError }}</p>
  <div class="form-actions">
    <button type="button" class="btn btn-ghost" @click="emit('close')">取消</button>
    <button type="button" class="btn btn-primary" @click="submit">保存</button>
  </div>
</template>

<style scoped>
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
.form-error {
  margin-top: 12px;
  font-size: 13px;
  color: var(--danger-color);
}
.attach-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.attach-item {
  position: relative;
}
.attach-item img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}
.attach-remove {
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
.attach-add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
}
.upload-errors {
  margin-top: 8px;
  padding-left: 0;
  list-style: none;
  font-size: 13px;
  color: var(--danger-color);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
