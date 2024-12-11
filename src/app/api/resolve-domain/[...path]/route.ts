import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  const domain = request.headers.get('host')
  
  if (!domain) {
    return NextResponse.redirect(new URL('/404', request.url))
  }

//   const { data:map, error } = await supabase
//     .from('maps')
//     .select()
//     .eq('domain', domain)
//     .single()

//   if (error || !map ) {
//     return NextResponse.redirect(new URL('/404', request.url))
//   }

console.log(domain)
return NextResponse.rewrite(new URL('/test1', request.url))

//   const urlname = map.name.replace(/\s+/g, "-")
//   const url = new URL(`/map/${urlname}`, request.url)
//   url.search = request.nextUrl.search
//   return NextResponse.rewrite(url)
}