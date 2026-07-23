'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { UserInput, FormErrors } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { saveTimeline } from '@/lib/storage';
import { COUNTRIES, GENDERS, AGE_RANGE, INPUT_LIMITS } from '@/lib/config';
import { reportError } from '@/lib/logger';

const countries = COUNTRIES;
const genders = GENDERS;
const KEY_DECISION_MAX = INPUT_LIMITS.maxKeyDecision;

export default function GeneratePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserInput>({
    age: 25,
    gender: '',
    country: '',
    occupation: '',
    status: '',
    keyDecision: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string>('');
  const [submitCount, setSubmitCount] = useState(0);

  const hasUnsavedChanges = formData.gender || formData.country || formData.occupation || formData.status || formData.keyDecision;

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.age || formData.age < AGE_RANGE.min || formData.age > AGE_RANGE.max) {
      newErrors.age = !formData.age
        ? '请输入年龄'
        : `请输入${AGE_RANGE.min}-${AGE_RANGE.max}之间的年龄`;
    }

    if (!formData.gender) {
      newErrors.gender = '请选择性别';
    }

    if (!formData.country) {
      newErrors.country = '请选择国家';
    }

    if (!formData.occupation.trim()) {
      newErrors.occupation = '请输入职业';
    }

    if (!formData.status.trim()) {
      newErrors.status = '请描述当前状态';
    }

    if (!formData.keyDecision.trim() || formData.keyDecision.length < 20) {
      newErrors.keyDecision = '关键决定至少需要20个字符';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setApiError('');
    setSubmitCount(prev => prev + 1);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: formData, type: 'timeline' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '生成失败');
      }

      const data = await response.json();

      // crypto.randomUUID 仅在安全上下文（https 或 localhost）可用；
      // 非安全 http 部署下降级为基于时间与随机数的 id，避免提交时崩溃。
      const timelineId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `tl-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const timelineData = {
        id: timelineId,
        createdAt: Date.now(),
        userInput: formData,
        result: data.result,
        images: [],
        processingTime: data.processingTime,
      };

      const saveResult = saveTimeline(timelineData);
      if (!saveResult.ok) {
        reportError('GeneratePage.save', saveResult.error);
        throw new Error(saveResult.error ?? '保存失败，请重试');
      }
      router.push(`/timeline/${timelineId}`);
    } catch (error) {
      reportError('GeneratePage.handleSubmit', error);
      setApiError(error instanceof Error ? error.message : '生成失败,请重试');
    } finally {
      setLoading(false);
    }
  };

  const fillExample = () => {
    setFormData({
      age: 28,
      gender: '男',
      country: '中国',
      occupation: '互联网产品经理',
      status: '工作5年,薪资尚可但缺乏热情,每天通勤两小时',
      keyDecision:
        '如果当年没有接受大厂的offer,而是和大学室友一起去深圳创业,现在的我会过着怎样的生活?',
    });
    setErrors({});
  };

  const handleChange = (field: keyof UserInput, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除该字段的错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading) {
    return <Loading fullScreen message="正在计算平行宇宙..." />;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 返回按钮 */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          返回
        </motion.button>

        {/* 表单卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card variant="glass" className="p-8 md:p-12">
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
                探索你的平行人生
              </h1>
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="text-gray-400">
                  填写以下信息,AI将为你生成两条不同的人生时间线
                </p>
                <button
                  type="button"
                  onClick={fillExample}
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors shrink-0"
                >
                  ✨ 填充示例
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" aria-busy={loading} noValidate>
              {/* API错误提示 */}
              {apiError && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start justify-between gap-4">
                  <p className="text-sm text-red-400">{apiError}</p>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleSubmit()} className="text-red-400 hover:text-red-300 shrink-0">
                    重试
                  </Button>
                </div>
              )}

              {/* 基本信息 */}
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  id="age"
                  label="年龄"
                  type="number"
                  inputMode="numeric"
                  min={16}
                  max={60}
                  value={formData.age || ''}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    const val = parseInt(raw, 10);
                    if (raw === '') {
                      handleChange('age', 0);
                    } else if (!Number.isNaN(val)) {
                      handleChange('age', val);
                    }
                  }}
                  error={errors.age}
                  placeholder="例如: 25"
                />

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium mb-2 text-gray-300">
                    性别
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    aria-label="选择性别"
                    aria-invalid={errors.gender ? true : undefined}
                    aria-describedby={errors.gender ? 'gender-error' : undefined}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" className="bg-[#1a1e3d] text-white">请选择</option>
                    {genders.map(g => (
                      <option key={g} value={g} className="bg-[#1a1e3d] text-white">{g}</option>
                    ))}
                  </select>
                  {errors.gender && (
                    <p id="gender-error" role="alert" className="mt-1 text-sm text-red-400">{errors.gender}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium mb-2 text-gray-300">
                  国家/地区
                </label>
                <select
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  aria-label="选择国家或地区"
                  aria-invalid={errors.country ? true : undefined}
                  aria-describedby={errors.country ? 'country-error' : undefined}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  style={{ colorScheme: 'dark' }}
                >
                  <option value="" className="bg-[#1a1e3d] text-white">请选择</option>
                  {countries.map(c => (
                    <option key={c} value={c} className="bg-[#1a1e3d] text-white">{c}</option>
                  ))}
                </select>
                {errors.country && (
                  <p id="country-error" role="alert" className="mt-1 text-sm text-red-400">{errors.country}</p>
                )}
              </div>

              <Input
                id="occupation"
                label="当前职业"
                value={formData.occupation}
                onChange={(e) => handleChange('occupation', e.target.value)}
                error={errors.occupation}
                placeholder="例如: 软件工程师、学生、设计师"
              />

              <Textarea
                id="status"
                label="当前生活状态"
                rows={3}
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                error={errors.status}
                placeholder="描述你目前的生活状况、工作状态或心理状态..."
              />

              <div>
                <Textarea
                  id="keyDecision"
                  label="关键决定"
                  rows={4}
                  maxLength={KEY_DECISION_MAX}
                  value={formData.keyDecision}
                  onChange={(e) => handleChange('keyDecision', e.target.value)}
                  error={errors.keyDecision}
                  placeholder="描述你想要探索的关键决定,例如:&#10;- 如果当初选择去日本留学&#10;- 如果辞职创业而不是继续工作&#10;- 如果接受那份offer去北京发展"
                />
                <p className="mt-1 text-xs text-gray-500 text-right">
                  {formData.keyDecision.length} / {KEY_DECISION_MAX}
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-8"
                loading={loading}
                disabled={loading}
              >
                {submitCount > 0 ? '重新生成' : '开始生成平行世界'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
