<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useFamilyStore } from '../../stores/useFamilyStore'
import type { CheckupReport } from '../../types'
import { todayStr } from '../../utils/date'
import MultiImageUpload from './MultiImageUpload.vue'

const emit = defineEmits<{
  (e: 'save', data: Omit<CheckupReport, 'id' | 'createdAt'>): void
  (e: 'close'): void
}>()

const store = useFamilyStore()

const form = reactive({
  memberId: store.state.members[0]?.id ?? '',
  date: todayStr(),
  hospital: '',
  conclusion: '',
  images: [] as string[],
})

const formError = ref('')

function onImages(images: string[]) {
  form.images = images
  formError.value = ''
}

function submit() {
  if (!store.state.members.length) {
    formError.value = '请先在「家庭成员」中添加成员后再归档体检报告'
    return
  }
  if (!form.memberId) {
    formError.value = '请选择体检成员'
    return
  }
  if (!form.date) {
    formError.value = '请选择体检日期'
    return
  }
  if (!form.hospital.trim()) {
    formError.value = '请填写体检医院'
    return
  }
  if (!form.images.length) {
    formError.value = '请至少上传一张体检报告照片'
    return
  }
  emit('save', {
    memberId: form.memberId,
    date: form.date,
    hospital: form.hospital.trim(),
    conclusion: form.conclusion.trim(),
    images: [...form.images],
  })
}
</script>

<template>
  <div class="form-grid">
    <div class="form-group">
      <label class="form-label">体检成员 *</label>
      <select v-model="form.memberId" class="input">
        <option v-for="m in store.state.members" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">体检日期 *</label>
      <input v-model="form.date" type="date" :max="todayStr()" class="input" />
    </div>
    <div class="form-group span-2">
      <label class="form-label">体检医院 *</label>
      <input v-model="form.hospital" class="input" placeholder="如：市第一人民医院体检中心" />
    </div>
    <div class="form-group span-2">
      <label class="form-label">关键结论</label>
      <textarea
        v-model="form.conclusion"
        class="input textarea"
        rows="3"
        placeholder="如：血压、血糖等主要指标情况，医生建议，复查提醒等"
      ></textarea>
    </div>
    <div class="form-group span-2">
      <label class="form-label">报告照片 *（一份报告可上传多张）</label>
      <MultiImageUpload v-model="form.images" @update:model-value="onImages" />
    </div>
  </div>
  <p v-if="formError" class="form-error" role="alert">⚠️ {{ formError }}</p>
  <div class="form-actions">
    <button type="button" class="btn btn-ghost" @click="emit('close')">取消</button>
    <button type="button" class="btn btn-primary" @click="submit">保存归档</button>
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
  background: #fdecea;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  padding: 8px 12px;
}
</style>
