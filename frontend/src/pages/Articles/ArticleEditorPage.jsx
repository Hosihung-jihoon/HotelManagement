import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import {
  ChevronLeft, Save, Send, Eye, EyeOff, ImagePlus, RefreshCw,
  FileText, Tag, MapPin, LayoutList,
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import 'react-quill/dist/quill.snow.css';
import './ArticleEditorPage.css';

/* =========== Quill Toolbar Config =========== */
const QUILL_MODULES = {
  toolbar: {
    container: [
      [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean'],
    ],
  },
  clipboard: { matchVisual: false },
};

const QUILL_FORMATS = [
  'font', 'size', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'script',
  'blockquote', 'code-block',
  'list', 'bullet', 'indent', 'align',
  'link', 'image', 'video',
];

const emptyForm = {
  title: '', categoryId: '', attractionId: '',
  thumbnailUrl: '', content: '', isActive: true,
};

export default function ArticleEditorPage() {
  const { id } = useParams(); // undefined = new, number = edit
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  /* Load categories + locations + article detail */
  useEffect(() => {
    const init = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          axiosClient.get('/ArticleCategories'),
          axiosClient.get('/Attractions'),
        ]);
        setCategories(catRes.data || []);
        setLocations(locRes.data || []);

        if (isEdit) {
          setLoading(true);
          const res = await axiosClient.get(`/Articles/${id}`);
          const d = res.data;
          setForm({
            title: d.title || '',
            categoryId: d.categoryId || '',
            attractionId: d.attractionId || '',
            thumbnailUrl: d.thumbnailUrl || '',
            content: d.content || '',
            isActive: d.isActive ?? true,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, isEdit]);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  /* Upload thumbnail */
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await axiosClient.post('/Upload/image?folder=hotel/articles', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      f('thumbnailUrl', res.data.url);
    } catch (err) {
      alert('Upload ảnh thất bại: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  /* Save */
  const handleSave = async (publish = null) => {
    if (!form.title.trim()) { alert('Vui lòng nhập tiêu đề bài viết!'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        isActive: publish !== null ? publish : form.isActive,
        categoryId: form.categoryId ? parseInt(form.categoryId) : null,
        attractionId: form.attractionId ? parseInt(form.attractionId) : null,
      };
      if (isEdit) {
        await axiosClient.put(`/Articles/${id}`, payload);
      } else {
        await axiosClient.post('/Articles', payload);
      }
      setLastSaved(new Date());
      if (publish !== null) navigate('/articles');
    } catch (err) {
      alert('Lỗi lưu bài viết: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 60, color: 'var(--text-secondary)' }}>
        <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginRight: 10 }} />
        Đang tải bài viết...
      </div>
    );
  }

  return (
    <div className="article-editor-page">
      {/* ===== Top Bar ===== */}
      <div className="editor-topbar">
        <button className="editor-back-btn" onClick={() => navigate('/articles')}>
          <ChevronLeft size={16} /> Quay lại danh sách
        </button>
        <div className="editor-breadcrumb">
          <span>Bài viết</span>
          <span className="bc-sep">/</span>
          <span className="bc-current">{isEdit ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</span>
        </div>
        <div className="editor-topbar-actions">
          {lastSaved && (
            <span className="editor-saved-hint">
              ✓ Đã lưu lúc {lastSaved.toLocaleTimeString('vi-VN')}
            </span>
          )}
          <button className="editor-btn-draft" onClick={() => handleSave(false)} disabled={saving}>
            <Save size={15} /> {saving ? 'Đang lưu...' : 'Lưu nháp'}
          </button>
          <button className="editor-btn-publish" onClick={() => handleSave(true)} disabled={saving}>
            <Send size={15} /> {isEdit ? 'Cập nhật & Đăng' : 'Đăng bài'}
          </button>
        </div>
      </div>

      {/* ===== Editor Layout ===== */}
      <div className="editor-layout">
        {/* Left: Main Content Editor */}
        <div className="editor-main">
          <input
            className="editor-title-input"
            placeholder="Tiêu đề bài viết..."
            value={form.title}
            onChange={e => f('title', e.target.value)}
          />

          <div className="quill-wrapper">
            <ReactQuill
              theme="snow"
              value={form.content}
              onChange={v => f('content', v)}
              modules={QUILL_MODULES}
              formats={QUILL_FORMATS}
              placeholder="Bắt đầu viết nội dung bài viết của bạn..."
            />
          </div>
        </div>

        {/* Right: Article Settings */}
        <aside className="editor-sidebar">
          {/* Publish status card */}
          <div className="editor-sidebar-card">
            <div className="editor-sidebar-card-title"><Send size={15} /> Trạng thái</div>
            <div className="editor-status-toggle">
              <button
                className={`status-opt ${form.isActive ? 'active' : ''}`}
                onClick={() => f('isActive', true)}
              >
                <Eye size={14} /> Đăng công khai
              </button>
              <button
                className={`status-opt ${!form.isActive ? 'active' : ''}`}
                onClick={() => f('isActive', false)}
              >
                <EyeOff size={14} /> Nháp
              </button>
            </div>
          </div>

          {/* Category */}
          <div className="editor-sidebar-card">
            <div className="editor-sidebar-card-title"><LayoutList size={15} /> Danh mục</div>
            <select
              className="editor-select"
              value={form.categoryId}
              onChange={e => f('categoryId', e.target.value)}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Location */}
          <div className="editor-sidebar-card">
            <div className="editor-sidebar-card-title"><MapPin size={15} /> Địa điểm liên kết</div>
            <select
              className="editor-select"
              value={form.attractionId}
              onChange={e => f('attractionId', e.target.value)}
            >
              <option value="">-- Không liên kết --</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          {/* Thumbnail */}
          <div className="editor-sidebar-card">
            <div className="editor-sidebar-card-title"><ImagePlus size={15} /> Ảnh bìa (Thumbnail)</div>
            {form.thumbnailUrl && (
              <div className="editor-thumb-preview">
                <img src={form.thumbnailUrl} alt="Thumbnail" />
                <button className="editor-thumb-remove" onClick={() => f('thumbnailUrl', '')} title="Xóa ảnh">×</button>
              </div>
            )}
            {!form.thumbnailUrl && (
              <label className="editor-thumb-upload">
                <ImagePlus size={22} style={{ opacity: 0.5 }} />
                <span>{uploading ? 'Đang tải lên...' : 'Nhấn để tải ảnh lên'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* Slug info */}
          <div className="editor-sidebar-card editor-sidebar-info">
            <div className="editor-sidebar-card-title"><FileText size={15} /> Thông tin</div>
            <div className="editor-info-row">
              <span>Trạng thái</span>
              <span className={form.isActive ? 'info-val-green' : 'info-val-gray'}>
                {form.isActive ? 'Công khai' : 'Nháp'}
              </span>
            </div>
            <div className="editor-info-row">
              <span>Nội dung</span>
              <span className="info-val-gray">
                ~{Math.round((form.content || '').replace(/<[^>]+>/g, '').length / 5)} từ
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
