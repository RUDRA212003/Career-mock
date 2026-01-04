'use client';
import { useState, useEffect } from 'react';
import Dropzone from 'shadcn-dropzone';
import { supabase } from '@/services/supabaseClient';
import { toast } from 'sonner';
import { 
  FileText, 
  Trash2, 
  Download, 
  Loader2, 
  Upload,
  ChevronLeft,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button"; 
import { useRouter } from 'next/navigation';

export default function UploadCV() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.cv_file_path) {
      getSignedUrl(user.cv_file_path);
    } else {
      setPreviewUrl(null);
    }
  }, [user?.cv_file_path]);

  async function fetchUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: userData } = await supabase
        .from('users')
        .select('id, email, name, cv_file_path')
        .eq('email', session.user.email)
        .single();
      if (userData) setUser(userData);
    } catch (err) { console.error(err); }
  }

  async function getSignedUrl(path) {
    const { data } = await supabase.storage.from('cv-uploads').createSignedUrl(path, 3600);
    if (data) setPreviewUrl(data.signedUrl);
  }

  const handleFileDrop = (files) => { if (files.length > 0) setUploadedFile(files[0]); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const filePath = `cv/${user.id}/cv_${Date.now()}.pdf`;
      await supabase.storage.from('cv-uploads').upload(filePath, uploadedFile, { upsert: true });
      await supabase.from('users').update({ cv_file_path: filePath }).eq('id', user.id);
      setUser({ ...user, cv_file_path: filePath });
      setUploadedFile(null);
      toast.success('Sync Complete');
    } catch (error) { toast.error('Error'); } 
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await supabase.storage.from('cv-uploads').remove([user.cv_file_path]);
      await supabase.from('users').update({ cv_file_path: null }).eq('id', user.id);
      setUser({ ...user, cv_file_path: null });
      toast.success('CV Removed');
    } catch (error) { toast.error('Error'); } 
    finally { setLoading(false); }
  };

  if (!user) return <div className="flex h-screen items-center justify-center bg-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex flex-col h-screen bg-white text-[#1D1D1F] antialiased">
      
      {/* --- Simple Mobile Header --- */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <button onClick={() => router.back()} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-bold uppercase tracking-widest text-gray-400">Manage Resume</h1>
        <div className="w-8" /> 
      </nav>

      <div className="flex-1 overflow-hidden flex flex-col p-6">
        <AnimatePresence mode="wait">
          {user.cv_file_path ? (
            <motion.div 
              key="viewer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col h-full gap-6"
            >
              {/* User Label */}
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{user.name}&apos;s CV</h2>
                  <p className="text-xs font-medium text-blue-600">Active on your profile</p>
                </div>
                <Eye className="w-5 h-5 text-gray-300" />
              </div>

              {/* PDF Preview Area */}
              <div className="flex-1 bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                {previewUrl ? (
                  <iframe src={`${previewUrl}#toolbar=0`} className="w-full h-full border-none" />
                ) : (
                  <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-gray-300" /></div>
                )}
              </div>

              {/* Action Buttons - Pinned to bottom */}
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => window.open(previewUrl, '_blank')}
                  className="flex-1 h-14 rounded-2xl border-gray-200 font-bold"
                >
                  <Download className="w-4 h-4 mr-2" /> Download
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleDelete}
                  className="h-14 w-14 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 p-0"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="uploader"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col h-full justify-center text-center space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Upload Resume</h2>
                <p className="text-gray-500 font-medium">Add a PDF to start matching with AI roles.</p>
              </div>

              <div className="relative group">
                <Dropzone
                  onDropAccepted={handleFileDrop}
                  accept={{ 'application/pdf': ['.pdf'] }}
                  maxFiles={1}
                  className="h-64 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-4 transition-all hover:bg-blue-50 hover:border-blue-200"
                />
                {!uploadedFile ? (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <Upload className="w-10 h-10 mb-2" />
                    <span className="font-bold text-sm">Select PDF</span>
                  </div>
                ) : (
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-blue-600">
                    <FileText className="w-10 h-10 mb-2" />
                    <span className="font-bold text-sm truncate max-w-[200px]">{uploadedFile.name}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={handleSubmit}
                disabled={loading || !uploadedFile}
                className="w-full h-16 rounded-2xl bg-[#1D1D1F] text-white font-bold text-lg transition-transform active:scale-95"
              >
                {loading ? 'Processing...' : 'Upload Now'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}