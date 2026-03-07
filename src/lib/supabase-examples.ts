/**
 * Supabase Kullanım Örnekleri
 * Bu dosya sadece referans içindir - gerçek kodda kullanmayın
 */

import { supabase, createServerClient } from './supabase'

// ============================================
// 1. REAL-TIME SUBSCRIPTIONS
// ============================================

// Yeni pozisyonlar için real-time dinleme
export function subscribeToIncidents(callback: (incident: any) => void) {
  const channel = supabase
    .channel('incidents-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'Incident',
      },
      (payload) => {
        callback(payload.new as any)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// Maç güncellemeleri için dinleme
export function subscribeToMatches(callback: (match: any) => void) {
  return supabase
    .channel('matches-channel')
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'Match',
      },
      (payload) => {
        callback(payload.new || payload.old)
      }
    )
    .subscribe()
}

// ============================================
// 2. AUTHENTICATION
// ============================================

// Email/Password ile giriş
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

// Çıkış
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Mevcut kullanıcıyı al
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Session kontrolü
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// ============================================
// 3. STORAGE (Dosya Yükleme)
// ============================================

// Video yükleme
export async function uploadVideo(file: File, matchId: string) {
  const fileName = `${matchId}-${Date.now()}.mp4`
  
  const { data, error } = await supabase.storage
    .from('videos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  // Public URL al
  const { data: urlData } = supabase.storage
    .from('videos')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

// Fotoğraf yükleme (yorumcu fotoğrafları)
export async function uploadPhoto(file: File, commentatorId: string) {
  const fileName = `commentators/${commentatorId}.jpg`
  
  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}

// ============================================
// 4. DIRECT QUERIES (Prisma yerine kullanılabilir)
// ============================================

// Tüm maçları al
export async function getMatches() {
  const { data, error } = await supabase
    .from('Match')
    .select('*')
    .order('date', { ascending: false })

  return { data, error }
}

// Belirli bir maçın pozisyonlarını al
export async function getIncidentsByMatch(matchId: string) {
  const { data, error } = await supabase
    .from('Incident')
    .select('*')
    .eq('matchId', matchId)
    .eq('status', 'APPROVED')
    .order('minute', { ascending: true })

  return { data, error }
}

// ============================================
// 5. SERVER-SIDE OPERATIONS
// ============================================

// Server-side admin işlemleri için
export async function adminOperation() {
  const supabaseAdmin = createServerClient()
  
  // Service role key ile tüm işlemler yapılabilir
  const { data, error } = await supabaseAdmin
    .from('Incident')
    .update({ status: 'APPROVED' })
    .eq('id', 'some-id')

  return { data, error }
}
