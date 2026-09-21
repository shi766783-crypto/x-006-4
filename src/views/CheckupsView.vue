<script setup lang="ts">
import { computed, ref } from 'vue'
import CheckupForm from '../components/checkup/CheckupForm.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import EmptyState from '../components/ui/EmptyState.vue'
import { useFamilyStore } from '../stores/useFamilyStore'
import type { CheckupReport } from '../types'
import { formatDate } from '../utils/date'

const store = useFamilyStore()
const showForm = ref(false)
const filterMember = ref('all')
const previewImage = ref('')

const filtered = computed(() => {
  let list = store.state.checkups
  if (filterMember.value !== 'all') list = list.filter((c) => c.memberId === filterMember.value)
  return [...list].sort((a, b) => b.examDate.localeCompare(a.examDate))
})

function memberName(id: string) {
  return store.getMember(id)?.name ?? '—'
}

function onSave(data: Omit<CheckupReport, 'id' | 'createdAt'>) {
  store.addCheckup(data)
  showForm.value = false
}

function onDelete(report: CheckupReport) {
  if (window.confirm('确定删除该体检报告吗？')) {
    store.deleteCheckup(report.id)
  }
}
</script>

<template>
  <div class="page">
    <div class="page-head">
      <h1 class="page-title">体检报告</h1>
      <button type="button" class="btn btn-primary" @click="showForm = true">＋ 归档体检报告</button>
    </div>

    <!-- Filters -->
    <section class="card filters-card">
      <div class="filter-group">
        <label class="form-label">成员</label>
        <select v-model="filterMember" class="input">
          <option value="all">全部成员</option>
          <option v-for="m in store.state.members" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </div>
    </section>

    <div v-if="filtered.length" class="report-list">
      <div v-for="c in filtered" :key="c.id" class="report-item card">
        <div class="report-head">
          <div class="report-title">
            <strong>{{ memberName(c.memberId) }}</strong>
            <span class="report-date">{{ formatDate(c.examDate) }}</span>
          </div>
          <button type="button" class="btn btn-sm btn-danger-ghost" @click="onDelete(c)">删除</button>
        </div>
        <div class="report-meta">
          <span v-if="c.hospital">🏥 {{ c.hospital }}</span>
          <span>{{ c.images.length }} 张报告照片</span>
        </div>
        <div class="report-field"><label>关键结论：</label>{{ c.conclusion }}</div>
        <div v-if="c.images.length" class="report-images">
          <img
            v-for="(img, i) in c.images"
            :key="i"
            :src="img"
            alt="报告照片"
            @click="previewImage = img"
          />
        </div>
      </div>
    </div>
    <EmptyState v-else icon="🩻" text="暂无体检报告，点击右上角归档第一份报告" />
  </div>

  <BaseModal v-if="showForm" title="归档体检报告" @close="showForm = false">
    <CheckupForm @save="onSave" @close="showForm = false" />
  </BaseModal>

  <Teleport to="body">
    <div v-if="previewImage" class="image-preview" @click="previewImage = ''">
      <img :src="previewImage" alt="报告照片大图" />
    </div>
  </Teleport>
</template>

<style scoped>
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.page-title {
  margin: 0;
}
.filters-card {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.report-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.report-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.report-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.report-date {
  color: var(--text-secondary);
  font-size: 13px;
}
.report-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 8px;
}
.report-field {
  font-size: 14px;
  margin-top: 6px;
  color: var(--text-primary);
  white-space: pre-wrap;
}
.report-field label {
  color: var(--text-secondary);
}
.report-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.report-images img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  cursor: zoom-in;
}
.image-preview {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  cursor: zoom-out;
  padding: 24px;
}
.image-preview img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
}
</style>
