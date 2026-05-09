<template>
  <footer>
    <!-- Wave divider -->
    <div class="bg-[#f5f5f2] overflow-hidden leading-none">
      <svg
        viewBox="0 0 1440 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="w-full block"
      >
        <path
          d="M0,36 C180,72 360,0 540,36 C720,72 900,0 1080,36 C1260,72 1380,18 1440,36 L1440,72 L0,72 Z"
          fill="#7a8355"
        />
      </svg>
    </div>

    <!-- Main footer body -->
    <div class="bg-sage-500 text-earth-50 px-4 pt-12 pb-8">
      <div class="max-w-6xl mx-auto">
        <!-- Columns -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <!-- Brand -->
          <div>
            <p class="font-bold text-2xl tracking-tight mb-3 italic">syncyard</p>
            <p class="text-sage-200 text-sm leading-relaxed mb-6 max-w-[220px]">
              Open rooms. Real people. No invite needed. Your next conversation is already
              happening.
            </p>
            <RouterLink
              to="/signup"
              class="inline-flex items-center gap-2 border border-earth-50/40 hover:border-earth-50 text-earth-50 text-sm font-medium px-4 py-2 rounded-full transition-colors"
            >
              <span class="h-2 w-2 rounded-full bg-green-400 shrink-0" />
              Start a Sync now
            </RouterLink>
          </div>

          <!-- Explore -->
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-sage-300 mb-4">Explore</p>
            <ul class="space-y-2.5">
              <li>
                <RouterLink
                  to="/discover"
                  class="text-sm text-sage-100 hover:text-white transition-colors"
                  >Browse syncs</RouterLink
                >
              </li>
              <li>
                <RouterLink
                  to="/discover"
                  class="text-sm text-sage-100 hover:text-white transition-colors"
                  >Tech &amp; founders</RouterLink
                >
              </li>
              <li>
                <RouterLink
                  to="/discover"
                  class="text-sm text-sage-100 hover:text-white transition-colors"
                  >Creatives</RouterLink
                >
              </li>
              <li>
                <RouterLink
                  to="/discover"
                  class="text-sm text-sage-100 hover:text-white transition-colors"
                  >Late night grinds</RouterLink
                >
              </li>
              <li>
                <RouterLink
                  to="/discover"
                  class="text-sm text-sage-100 hover:text-white transition-colors"
                  >Girlies</RouterLink
                >
              </li>
              <li>
                <RouterLink
                  to="/discover"
                  class="text-sm text-sage-100 hover:text-white transition-colors"
                  >All topics</RouterLink
                >
              </li>
            </ul>
          </div>

          <!-- Syncyard -->
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-sage-300 mb-4">Syncyard</p>
            <ul class="space-y-2.5">
              <li>
                <a href="#" class="text-sm text-sage-100 hover:text-white transition-colors"
                  >How it works</a
                >
              </li>
              <li>
                <RouterLink
                  to="/signup"
                  class="text-sm text-sage-100 hover:text-white transition-colors"
                  >Host a Sync</RouterLink
                >
              </li>
              <li>
                <a href="#" class="text-sm text-sage-100 hover:text-white transition-colors"
                  >Community guidelines</a
                >
              </li>
              <li>
                <a href="#" class="text-sm text-sage-100 hover:text-white transition-colors"
                  >Blog</a
                >
              </li>
              <li>
                <a href="#" class="text-sm text-sage-100 hover:text-white transition-colors"
                  >Careers</a
                >
              </li>
            </ul>
          </div>

          <!-- Support -->
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-sage-300 mb-4">Support</p>
            <ul class="space-y-2.5">
              <li>
                <a href="#" class="text-sm text-sage-100 hover:text-white transition-colors"
                  >Help centre</a
                >
              </li>
              <li>
                <a href="#" class="text-sm text-sage-100 hover:text-white transition-colors"
                  >Report a Sync</a
                >
              </li>
              <li>
                <a href="#" class="text-sm text-sage-100 hover:text-white transition-colors"
                  >Privacy policy</a
                >
              </li>
              <li>
                <a href="#" class="text-sm text-sage-100 hover:text-white transition-colors"
                  >Terms of use</a
                >
              </li>
              <li>
                <a href="#" class="text-sm text-sage-100 hover:text-white transition-colors"
                  >Contact us</a
                >
              </li>
            </ul>
          </div>
        </div>

        <!-- Bottom bar -->
        <div
          class="pt-6 border-t border-sage-600 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p class="text-sage-300 text-xs">© 2025 Syncyard. All rights reserved.</p>

          <div class="flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-green-400" />
            <span class="text-sage-200 text-xs">247 rooms open right now</span>
          </div>

          <div class="flex items-center gap-2">
            <a
              href="#"
              aria-label="Twitter"
              class="h-8 w-8 rounded-full border border-sage-400/50 hover:border-earth-50 flex items-center justify-center text-sage-200 hover:text-white transition-colors"
            >
              <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Instagram"
              class="h-8 w-8 rounded-full border border-sage-400/50 hover:border-earth-50 flex items-center justify-center text-sage-200 hover:text-white transition-colors"
            >
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke-width="1.5" />
                <circle cx="12" cy="12" r="4" stroke-width="1.5" />
                <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              class="h-8 w-8 rounded-full border border-sage-400/50 hover:border-earth-50 flex items-center justify-center text-sage-200 hover:text-white transition-colors"
            >
              <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>
