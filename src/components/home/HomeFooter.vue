<template>
  <footer class="border-t border-earth-200 dark:border-earth-700 py-12 px-4 mt-8">
    <div class="max-w-6xl mx-auto">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
        <div>
          <p class="text-earth-900 dark:text-earth-100 font-bold text-lg tracking-tight mb-2">Syncyard</p>
          <p class="text-earth-400 text-sm leading-relaxed max-w-xs">
            A creative collaboration network. Find your people, build something great.
          </p>
        </div>

        <div>
          <p class="text-earth-400 text-xs font-medium uppercase tracking-wider mb-4">Product</p>
          <ul class="space-y-2.5">
            <li><RouterLink to="/" class="text-sm text-earth-400 hover:text-earth-900 dark:hover:text-earth-100 transition-colors">Home</RouterLink></li>
            <li><RouterLink to="/discover" class="text-sm text-earth-400 hover:text-earth-900 dark:hover:text-earth-100 transition-colors">Discover</RouterLink></li>
            <li><RouterLink to="/signup" class="text-sm text-earth-400 hover:text-earth-900 dark:hover:text-earth-100 transition-colors">Sign up</RouterLink></li>
          </ul>
        </div>

        <div>
          <p class="text-earth-400 text-xs font-medium uppercase tracking-wider mb-4">Elsewhere</p>
          <div class="flex items-center gap-3">
            <a href="#" class="h-8 w-8 rounded-lg bg-earth-200 dark:bg-earth-800 hover:bg-earth-300 dark:hover:bg-earth-700 flex items-center justify-center text-earth-400 hover:text-earth-900 dark:hover:text-earth-100 transition-colors" aria-label="Twitter">
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" class="h-8 w-8 rounded-lg bg-earth-200 dark:bg-earth-800 hover:bg-earth-300 dark:hover:bg-earth-700 flex items-center justify-center text-earth-400 hover:text-earth-900 dark:hover:text-earth-100 transition-colors" aria-label="Instagram">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4m0 4a4 4 0 014-4h8a4 4 0 014 4v8a4 4 0 01-4 4H8a4 4 0 01-4-4V8z" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div class="pt-6 border-t border-earth-200 dark:border-earth-700 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-earth-400 text-xs">© {{ new Date().getFullYear() }} Syncyard. All rights reserved.</p>
        <p class="text-earth-400 dark:text-earth-500 text-xs">Made for creatives, by creatives.</p>
      </div>
    </div>
  </footer>
</template>
