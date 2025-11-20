
        // Local Storage Data
        let lang = localStorage.getItem('lang') || 'ne';
        let showLanguageModal = !localStorage.getItem('lang');
        let role = localStorage.getItem('role') || 'user';
        let adminName = localStorage.getItem('adminName') || 'Admin';
        let notices = JSON.parse(localStorage.getItem('notices') || '[]');
        notices = notices.map((n, idx) => ({ ...n, id: n.id || Date.now() + idx }));
        if (notices.length > 0) localStorage.setItem('notices', JSON.stringify(notices));
        // Hero image banner (single photo managed by admin)
        let heroBanner = JSON.parse(localStorage.getItem('heroBanner') || 'null');
        if (!heroBanner) {
            heroBanner = {
                src: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?auto=format&fit=crop&w=1600&q=80',
                caption: ''
            };
            localStorage.setItem('heroBanner', JSON.stringify(heroBanner));
        }
        let heroDraft = { caption: heroBanner.caption || '', photo: heroBanner.src || null };
        let queries = JSON.parse(localStorage.getItem('queries') || '[]');
        let userQueries = JSON.parse(localStorage.getItem('userQueries') || '[]');
        let capturedImage = null;
        let cameraStream = null;
        let currentView = 'home';
        let editingNoticeId = null;
        let noticePhoto = null;
        let popupMessage = JSON.parse(localStorage.getItem('popupMessage') || 'null');
        let popupDismissed = localStorage.getItem('popupDismissed') === 'true';
        let popupPhoto = null;
        let latestNewsDismissed = localStorage.getItem('latestNewsDismissed') === 'true';
        let noticeDraft = { title: '', content: '' };

        const emergencyContacts = [
            { key: 'municipality', number: '1112', description: { ne: 'नगरपालिका हाटलाइन', en: 'Municipality Hotline' }, icon: '🏛️' },
            { key: 'police', number: '100', description: { ne: 'नेपाल प्रहरी', en: 'Nepal Police' }, icon: '👮' },
            { key: 'ambulance', number: '102', description: { ne: 'एम्बुलेन्स सेवा', en: 'Ambulance Service' }, icon: '🚑' },
            { key: 'fire', number: '101', description: { ne: 'दमकल', en: 'Fire Brigade' }, icon: '🚒' },
            { key: 'health', number: '1660-01-50005', description: { ne: 'स्वास्थ्य परामर्श', en: 'Health Consultation' }, icon: '🩺' },
            { key: 'women', number: '1145', description: { ne: 'महिला हेल्पलाइन', en: 'Women Helpline' }, icon: '👩' }
        ];

        // Staff directory (shown in Support Center)
        const staffContacts = [
            { id: 's1', name: 'Ram Bahadur', role: { ne: 'नगर प्रमुख', en: 'Municipality Chief' }, phone: '01-4210001', email: 'ram.bahadur@gau-shiksha.gov.np', photo: '' },
            { id: 's2', name: 'Sita Devi', role: { ne: 'स्वास्थ्य अधिकृत', en: 'Health Officer' }, phone: '01-4210002', email: 'sita.devi@gau-shiksha.gov.np', photo: '' },
            { id: 's3', name: 'Hari Prasad', role: { ne: 'प्रशासकीय अधिकृत', en: 'Administrative Officer' }, phone: '01-4210003', email: 'hari.prasad@gau-shiksha.gov.np', photo: '' }
        ];

        // Which tab/accordion state is active in Support Center
        let supportTab = localStorage.getItem('supportTab') || 'emergency';
        let supportAccordion = JSON.parse(localStorage.getItem('supportAccordion') || 'null') || { emergency: true, staff: false };
        // staff search/filter state
        let staffFilter = localStorage.getItem('staffFilter') || '';

        // Generates a simple svg avatar data URL with initials for staff placeholders
        function avatarDataURL(name, bg = '#e6f6ff') {
            try {
                const initials = (name || '').split(' ').map(n => n[0] || '').slice(0, 2).join('').toUpperCase() || 'NA';
                const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Inter, Roboto, sans-serif' font-size='72' fill='#0369a1' font-weight='700'>${initials}</text></svg>`;
                return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
            } catch (e) { return ''; }
        }

        const texts = {
            ne: {
                appName: "गौ-शिक्षा पोर्टल",
                home: "गृह",
                homeTagline: "सार्वजनिक सूचना र प्रश्न पेस गर्ने सरल तरिका",
                notices: "सूचनाहरू",
                submitQuery: "प्रश्न पेस गर्नुहोस्",
                adminLogin: "प्रशासक लगइन",
                adminDashboardTitle: "प्रशासक ड्यासबोर्ड",
                logout: "बाहिर निस्कनुहोस्",
                publishNotice: "सूचना प्रकाशित गर्नुहोस्",
                viewQueries: "प्रश्नहरू हेर्नुहोस्",
                noticeTitle: "सूचनाको शीर्षक",
                content: "सामग्री",
                querySubject: "प्रश्नको विषय",
                yourProblem: "तपाईंको समस्या/प्रश्न विस्तारपूर्वक लेख्नुहोस्",
                takeLivePhoto: "प्रत्यक्ष फोटो लिनुहोस्",
                capture: "कैद गर्नुहोस्",
                recapture: "पुनः कैद गर्नुहोस्",
                submit: "पेस गर्नुहोस्",
                noNotices: "अहिलेसम्म कुनै सूचना प्रकाशित गरिएको छैन।",
                noQueries: "कुनै प्रश्न छैन।",
                querySuccess: "प्रश्न सफलतापूर्वक पेस भयो! धन्यवाद।",
                noticeSuccess: "सूचना सफलतापूर्वक प्रकाशित भयो!",
                loginFailed: "लगइन असफल भयो।",
                username: "प्रयोगकर्ता नाम",
                password: "पासवर्ड",
                loginButton: "लगइन गर्नुहोस्",
                publishedBy: "प्रकाशक",
                date: "मिति",
                new: "नयाँ",
                seen: "हेरिएको",
                queryStatusUpdate: "हेरिएको रूपमा चिन्ह लगाउनुहोस्",
                queryStatusUpdateBack: "नयाँ रूपमा चिन्ह लगाउनुहोस्",
                cameraAccess: "क्यामेरा पहुँच गर्दै...",
                cameraReady: "तयार छ! कैद गर्नुहोस् बटन थिच्नुहोस्।",
                cameraUnavailable: "क्यामेरा उपलब्ध छैन।",
                fillAllFields: "सबै क्षेत्र भर्नुहोस्",
                needTitleContent: "शीर्षक र सामग्री आवश्यक छ",
                demoCredentials: "डेमो: admin / 123",
                chooseLanguageTitle: "कृपया भाषा चयन गर्नुहोस्",
                chooseLanguageSubtitle: "सम्पूर्ण पोर्टल नेपाली वा अंग्रेजीमा उपलब्ध छ।",
                chooseLanguageCTA: "भाषा चयन गर्नुहोस्",
                nepaliLabel: "नेपाली",
                englishLabel: "अंग्रेजी",
                photoInstructions: "प्रत्यक्ष फोटो लिनुहोस् वा उपकरणबाट छवि छान्नुहोस्।",
                chooseFromDevice: "उपकरणबाट छान्नुहोस्",
                photoReady: "फोटो तयार छ। आवश्यक परे पुनः कैद गर्नुहोस्।",
                adminSubtitle: "सूचना र नागरिक प्रश्नहरू एकै स्थानबाट व्यवस्थापन गर्नुहोस्।",
                welcomeBack: "स्वागत छ",
                totalNotices: "कुल सूचनाहरू",
                totalQueries: "कुल प्रश्नहरू",
                pendingQueries: "नयाँ प्रश्नहरू",
                quickActions: "द्रुत कार्यहरू",
                latestQueries: "भर्खरै आएका प्रश्नहरू",
                viewAllQueries: "सबै प्रश्न हेर्नुहोस्",
                noticeEditor: "सूचना सम्पादक",
                queryBoard: "प्रश्न बोर्ड",
                noRecentQueries: "हाल कुनै प्रश्न उपलब्ध छैन।",
                citizenName: "नागरिकको नाम",
                citizenLocation: "वडा/ठेगाना",
                citizenNamePlaceholder: "तपाईंको पूरा नाम लेख्नुहोस्",
                citizenLocationPlaceholder: "वडा, नगरपालिका/पालिका",
                anonymousUser: "अनाम प्रयोगकर्ता",
                unknownLocation: "ठेगाना उपलब्ध छैन",
                latestNotice: "नवीनतम सूचना",
                viewAllNotices: "सबै सूचना हेर्नुहोस्",
                manageNotices: "सूचना व्यवस्थापन",
                editNotice: "सम्पादन गर्नुहोस्",
                deleteNotice: "मेटाउनुहोस्",
                updateNotice: "अपडेट गर्नुहोस्",
                noticeUpdated: "सूचना सफलतापूर्वक अपडेट भयो!",
                noticeDeleted: "सूचना मेटाइयो!",
                confirmDelete: "के तपाईं यो सूचना मेटाउन चाहनुहुन्छ?",
                cancel: "रद्द गर्नुहोस्",
                confirm: "पुष्टि गर्नुहोस्",
                confirmLogout: "के तपाईं लगआउट गर्न चाहनुहुन्छ?",
                logoutSuccess: "सफलतापूर्वक लगआउट भयो।",
                reply: "जवाफ दिनुहोस्",
                replyPlaceholder: "तपाईंको जवाफ लेख्नुहोस्...",
                submitReply: "जवाफ पेस गर्नुहोस्",
                replySuccess: "जवाफ सफलतापूर्वक पेस भयो!",
                adminReply: "प्रशासकको जवाफ",
                noReply: "अझै जवाफ दिइएको छैन",
                replied: "जवाफ दिइसकिएको",
                myQueries: "मेरो प्रश्नहरू",
                myQueriesTitle: "तपाईंले पेस गरेका प्रश्नहरू",
                noMyQueries: "तपाईंले अहिलेसम्म कुनै प्रश्न पेस गर्नुभएको छैन।",
                queryDate: "मिति",
                waitingForReply: "जवाफको लागि पर्खिरहेको",
                addPhotoOrFile: "फोटो वा फाइल थप्नुहोस्",
                noticePhotoInstructions: "सूचनासँग फोटो वा फाइल थप्नुहोस् (वैकल्पिक)",
                removePhoto: "फोटो हटाउनुहोस्",
                popupMessage: "पपअप सन्देश",
                managePopup: "पपअप व्यवस्थापन",
                popupTitle: "शीर्षक",
                popupContent: "सामग्री",
                setPopupMessage: "पपअप सन्देश सेट गर्नुहोस्",
                clearPopup: "पपअप हटाउनुहोस्",
                popupSet: "पपअप सन्देश सेट भयो!",
                popupCleared: "पपअप सन्देश हटाइयो!",
                close: "बन्द गर्नुहोस्",
                dontShowAgain: "पुन: नदेखाउने",
                latestNews: "नवीनतम समाचार",
                viewDetails: "विस्तृत हेर्नुहोस्",
                contacts: "सम्पर्क",
                support: "सहायता केन्द्र",
                contactInfoTitle: "सम्पर्क जानकारी",
                hotlineHeading: "नगरपालिका हाटलाइन",
                emergencyNumbersTitle: "आपतकालीन सेवाहरू",
                addressHeading: "ठेगाना",
                officeAddress: "गौ-शिक्षा नगरपालिका, वडा नं ७, रुपन्देही",
                emailHeading: "इमेल",
                emailValue: "info@gau-shiksha.gov.np",
                serviceHoursHeading: "सेवा समय",
                serviceHoursValue: "आइतबार - शुक्रबार, बिहान १०:०० - बेलुका ५:००",
                callNow: "फोन गर्नुहोस्",
                updatesHeading: "अद्यावधिकहरू",
                movingText: "ताजा सूचना, सेवाहरू र नागरिक सहयोग एकै स्थानमा | गौ-शिक्षा नगरपालिका"
            },
            en: {
                appName: "Gau-Shiksha Portal",
                home: "Home",
                homeTagline: "Simple way to submit public notices and queries",
                notices: "Notices",
                submitQuery: "Submit Query",
                adminLogin: "Admin Login",
                adminDashboardTitle: "Admin Dashboard",
                logout: "Logout",
                publishNotice: "Publish Notice",
                viewQueries: "View Queries",
                noticeTitle: "Notice Title",
                content: "Content",
                querySubject: "Query Subject",
                yourProblem: "Describe your problem/query in detail",
                takeLivePhoto: "Take Live Photo",
                capture: "Capture",
                recapture: "Retake",
                submit: "Submit",
                noNotices: "No notices published yet.",
                noQueries: "No queries yet.",
                querySuccess: "Query submitted successfully!",
                noticeSuccess: "Notice published successfully!",
                loginFailed: "Login failed.",
                username: "Username",
                password: "Password",
                loginButton: "Login",
                publishedBy: "Published by",
                date: "Date",
                new: "New",
                seen: "Seen",
                queryStatusUpdate: "Mark as Seen",
                queryStatusUpdateBack: "Mark as New",
                cameraAccess: "Accessing camera...",
                cameraReady: "Ready! Press capture.",
                cameraUnavailable: "Camera unavailable.",
                fillAllFields: "Please fill all fields",
                needTitleContent: "Title and content are required",
                demoCredentials: "Demo: admin / 123",
                chooseLanguageTitle: "Please choose your language",
                chooseLanguageSubtitle: "The entire portal is available in Nepali or English.",
                chooseLanguageCTA: "Select Language",
                nepaliLabel: "Nepali",
                englishLabel: "English",
                photoInstructions: "Take a live photo or choose an image from your device.",
                chooseFromDevice: "Choose from Device",
                photoReady: "Photo is ready. Retake if you need a better shot.",
                adminSubtitle: "Manage notices and citizen queries in one place.",
                welcomeBack: "Welcome back",
                totalNotices: "Total Notices",
                totalQueries: "Total Queries",
                pendingQueries: "New Queries",
                quickActions: "Quick actions",
                latestQueries: "Latest Queries",
                viewAllQueries: "View all queries",
                noticeEditor: "Notice Editor",
                queryBoard: "Query Board",
                noRecentQueries: "No recent queries yet.",
                citizenName: "Citizen Name",
                citizenLocation: "Ward/Location",
                citizenNamePlaceholder: "Enter your full name",
                citizenLocationPlaceholder: "Ward, Municipality",
                anonymousUser: "Anonymous User",
                unknownLocation: "Location not provided",
                latestNotice: "Latest Notice",
                viewAllNotices: "View all notices",
                manageNotices: "Manage Notices",
                editNotice: "Edit",
                deleteNotice: "Delete",
                updateNotice: "Update Notice",
                noticeUpdated: "Notice updated successfully!",
                noticeDeleted: "Notice deleted!",
                confirmDelete: "Are you sure you want to delete this notice?",
                cancel: "Cancel",
                confirm: "Confirm",
                confirmLogout: "Are you sure you want to logout?",
                logoutSuccess: "Logged out successfully.",
                reply: "Reply",
                replyPlaceholder: "Write your reply...",
                submitReply: "Submit Reply",
                replySuccess: "Reply submitted successfully!",
                adminReply: "Admin Reply",
                noReply: "No reply yet",
                replied: "Replied",
                myQueries: "My Queries",
                myQueriesTitle: "Your Submitted Queries",
                noMyQueries: "You haven't submitted any queries yet.",
                queryDate: "Date",
                waitingForReply: "Waiting for reply",
                addPhotoOrFile: "Add Photo or File",
                noticePhotoInstructions: "Add a photo or file to the notice (optional)",
                removePhoto: "Remove Photo",
                popupMessage: "Popup Message",
                managePopup: "Manage Popup",
                popupTitle: "Title",
                popupContent: "Content",
                setPopupMessage: "Set Popup Message",
                clearPopup: "Clear Popup",
                popupSet: "Popup message set!",
                popupCleared: "Popup message cleared!",
                close: "Close",
                dontShowAgain: "Don't show again",
                latestNews: "Latest News",
                viewDetails: "View Details",
                contacts: "Contact",
                support: "Support Center",
                contactInfoTitle: "Contact Information",
                hotlineHeading: "Municipality Hotline",
                emergencyNumbersTitle: "Emergency Services",
                addressHeading: "Address",
                officeAddress: "Gau-Shiksha Municipality, Ward 7, Rupandehi",
                emailHeading: "Email",
                emailValue: "info@gau-shiksha.gov.np",
                serviceHoursHeading: "Service Hours",
                serviceHoursValue: "Sunday - Friday, 10:00 AM - 5:00 PM",
                callNow: "Call Now",
                updatesHeading: "Updates",
                movingText: "Latest notices, services and citizen support from Gau-Shiksha Municipality"
            }
        };
        const t = (key) => texts[lang][key] || key;

        // Moving marquee text (editable by admin)
        let movingText = JSON.parse(localStorage.getItem('movingText') || 'null') || { ne: texts.ne.movingText, en: texts.en.movingText };

        function toast(msg, error = false) {
            const div = Object.assign(document.createElement('div'), {
                textContent: msg,
                className: `fixed top-4 right-4 z-50 p-5 rounded-xl shadow-2xl text-white font-bold text-lg transition-opacity ${error ? 'bg-red-600' : 'bg-green-600'}`,
                onclick: () => div.remove()
            });
            document.body.appendChild(div);
            setTimeout(() => div.style.opacity = '0', 3000);
            setTimeout(() => div.remove(), 3500);
        }

        function formatDate(d) {
            return new Date(d).toLocaleString(lang === 'ne' ? 'ne-NP' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        }

        function renderEmblem() {
            return `
            <a href="#" onclick="currentView='home';render()" class="flex items-center mr-3" aria-label="${t('appName')}">
                <img src="./emblem.png" alt="Nepal Government Emblem" class="emblem mr-3 drop-shadow-lg" loading="lazy">
                <div class="hidden sm:flex flex-col leading-tight text-gray-700">
                    <span class="text-sm font-semibold tracking-wide uppercase">${lang === 'ne' ? 'नेपाल सरकार' : 'Government of Nepal'}</span>
                    <span class="text-xs">${lang === 'ne' ? 'गौ-शिक्षा विभाग' : 'Gau-Shiksha Division<br>Pokhara,Kaski,Nepal'}</span>
                </div>
            </a>`;
        }

        function renderLanguageButtons() {
            return `
            <div class="flex items-center border border-gray-200 rounded-full overflow-hidden shadow-sm">
                <button onclick="setLanguage('ne')" class="lang-btn px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm lg:text-base font-semibold ${lang === 'ne' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}">${t('nepaliLabel')}</button>
                <button onclick="setLanguage('en')" class="lang-btn px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm lg:text-base font-semibold ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}">${t('englishLabel')}</button>
            </div>`;
        }

        function renderNavbar() {
            return `
        <nav class="bg-white shadow-xl sticky top-0 z-40">
            <div class="navbar-inner px-4 py-3">
                <div class="nav-left" aria-label="${t('appName')}">
                    ${renderEmblem()}
                </div>
                <div class="nav-center">
                    ${['home', 'notices', 'support'].map(v => `<a href="#" onclick="currentView='${v}';render()" class="nav-link ${currentView === v ? 'text-blue-600 font-bold' : ''}">${t(v)}</a>`).join('')}
                    <div class="queries-dropdown" id="queriesDropdown">
                        <button class="queries-btn" onclick="document.getElementById('queriesDropdown').classList.toggle('active')">📋 ${lang === 'ne' ? 'प्रश्न' : 'Queries'} <span style="font-size: 0.8rem;">▼</span></button>
                        <div class="queries-dropdown-menu">
                            <a href="#" onclick="currentView='submitQuery'; render()">${t('submitQuery')}</a>
                            <a href="#" onclick="currentView='myQueries'; render()">${t('myQueries')}</a>
                        </div>
                    </div>
                    <a href="https://askifyz.netlify.app/" target="_blank" rel="noopener noreferrer" class="mcq-nav-btn ml-2" aria-label="Generate MCQ">📚 MCQ</a>
                </div>
                <div class="nav-right">
                    ${renderLanguageButtons()}
                    <div>
                        ${role === 'admin' ? `<a href="#" onclick="currentView='adminDashboard';render()" class="inline-flex items-center text-sm font-medium text-purple-600 ml-2"><span class="mr-2 text-lg">👤</span>${t('adminLogin').replace('Login', 'Dashboard')}</a>` : `<a href="#" onclick="currentView='adminLogin';render()" class="inline-flex items-center text-sm font-medium ml-2"><span class="mr-2 text-lg">👤</span>${t('adminLogin')}</a>`}
                    </div>
                    ${role === 'admin' ? `<button onclick="adminLogout()" class="bg-red-600 text-white px-3 py-2 rounded-xl font-bold text-sm hover:bg-red-700 transition ml-2">${t('logout')}</button>` : ''}
                </div>
            </div>
        </nav>`;
        }

        function isNewNotice(notice) {
            if (!notice.date) return false;
            const noticeDate = new Date(notice.date);
            const now = new Date();
            const daysDiff = (now - noticeDate) / (1000 * 60 * 60 * 24);
            return daysDiff <= 7; // Consider notices from last 7 days as "new"
        }

        function renderMarquee() {
            const highlightTitles = notices.slice(0, 5).map(n => n.title).join(' • ');
            const base = ((movingText && movingText[lang]) ? movingText[lang] : t('movingText')) + (highlightTitles ? ' • ' + highlightTitles : '');
            // Render two copies so the animation can loop smoothly and fill the whole bar
            return `
        <div class="marquee text-sm md:text-base py-2 px-4 bg-blue-600 text-white overflow-hidden">
            <div class="marquee__inner gap-8">
                <div class="marq-item">${base}</div>
                <div class="marq-item">${base}</div>
            </div>
        </div>`;
        }

        function renderHeroImageCard() {
            if (!heroBanner || !heroBanner.src) {
                return `<div class="hero-image-card bg-slate-200 flex items-center justify-center text-slate-500">
                    <div class="text-center">
                        <p class="font-semibold mb-2">${lang === 'ne' ? 'कृपया ठूलो फोटो अपलोड गर्नुहोस्' : 'Upload a hero image from the admin panel'}</p>
                        ${role === 'admin' ? `<button onclick="openHeroManager()" class="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">${lang === 'ne' ? 'फोटो थप्नुहोस्' : 'Add Photo'}</button>` : ''}
                    </div>
                </div>`;
            }
            return `
                <div class="hero-image-card">
                    <img src="${heroBanner.src}" alt="hero-banner">
                    <div class="hero-caption">
                        <h3>${heroBanner.caption || (lang === 'ne' ? 'गौ-शिक्षाको परोपकारी सेवाहरू' : 'Essential civic services')}</h3>
                        ${heroBanner.caption ? `<p>${lang === 'ne' ? 'प्रशासनद्वारा अपडेट' : 'Updated by administration'}</p>` : ''}
                    </div>
                </div>
            `;
        }

        // (Slideshow removed – hero banner is static)

        function renderHome() {
            const updates = notices.slice(0, 5);
            const totalQueries = queries.length;
            const pendingQueries = queries.filter(q => q.status === 'new').length;
            const stats = [
                { label: t('totalNotices'), value: notices.length },
                { label: t('totalQueries'), value: totalQueries },
                { label: t('pendingQueries'), value: pendingQueries }
            ];
            const formatStatValue = (value) => {
                const fallback = value || 0;
                return lang === 'ne' ? toNepaliDigits(fallback) : fallback.toLocaleString('en-US');
            };
            const quickActions = [
                {
                    icon: '📝',
                    title: t('submitQuery'),
                    desc: lang === 'ne' ? 'गुनासो वा सेवा अनुरोध केही मिनेटमै पठाउनुहोस्।' : 'Send a grievance or service request in just a few minutes.',
                    action: "currentView='submitQuery';render()"
                },
                {
                    icon: '📢',
                    title: t('notices'),
                    desc: lang === 'ne' ? 'नवीनतम सूचना, निर्णय र सार्वजनिक अपडेट पढ्नुहोस्।' : 'Read the latest notices, decisions, and public updates.',
                    action: "currentView='notices';render()"
                },
                {
                    icon: '🤝',
                    title: t('support'),
                    desc: lang === 'ne' ? 'आपतकालीन सम्पर्क र सहायता डेस्कसँग तुरुन्त सम्पर्क राख्नुहोस्।' : 'Reach emergency contacts and the support desk instantly.',
                    action: "currentView='support';render()"
                },
                {
                    icon: '☎️',
                    title: t('contacts'),
                    desc: lang === 'ne' ? 'ठेगाना, हाटलाइन र सेवा समयको सम्पूर्ण विवरण।' : 'Get detailed addresses, hotlines, and service timings.',
                    action: "currentView='contacts';render()"
                }
            ];
            return `
        <div class="page-bg py-10 px-4">
            <div class="max-w-7xl mx-auto space-y-10">
                <section class="home-hero">
                    <div class="hero-copy card gradient-card">
                        <span class="hero-tag text-blue-600">${lang === 'ne' ? 'अधिकृत पोर्टल' : 'Official Portal'}</span>
                        <h1 class="text-4xl md:text-5xl font-extrabold leading-tight z-10 text-blue-600">${t('appName')}</h1>
                        <p class="text-blue-600 text-lg md:text-xl z-10">${lang === 'ne' ? 'नगरपालिकाका सूचना, सेवाहरू र सहयोग एकै स्थानमा पहुँचयोग्य।' : 'Access municipal notices, services, and assistance from one place.'}</p>
                        <div class="hero-cta z-10">
                            <button onclick="currentView='submitQuery';render()" class="btn-primary bg-white text-blue-700 text-base md:text-lg">
                                ${t('submitQuery')}
                            </button>
                            <button onclick="currentView='notices';render()" class="btn-secondary hero-secondary text-blue-600 text-base md:text-lg">
                                ${t('viewAllNotices')}
                            </button>
                </div>
                        <div class="hero-stats z-10">
                            ${stats.map(stat => `
                                <div class="stat-pill">
                                    <span class="stat-value">${formatStatValue(stat.value)}</span>
                                    <span class="stat-label text-blue-600">${stat.label}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="hero-media card hero-media-card">
                        ${renderHeroImageCard()}
                        </div>
                </section>

                <section class="space-y-4">
                    <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                        <div>
                            <p class="tag-pill">${lang === 'ne' ? 'द्रुत पहुँच' : 'Quick Access'}</p>
                            <h3 class="page-section-title">${lang === 'ne' ? 'नागरिकका लागि आवश्यक सेवा' : 'Essential services for citizens'}</h3>
                    </div>
                        <p class="text-sm text-slate-500">${lang === 'ne' ? 'सबैभन्दा बढी प्रयोग हुने सुविधाहरू केही क्लिकमै।' : 'Your most requested tools are only a few clicks away.'}</p>
                    </div>
                    <div class="quick-actions-grid">
                        ${quickActions.map(action => `
                            <button type="button" class="quick-card" onclick="${action.action}">
                                <span class="quick-card-icon" aria-hidden="true">${action.icon}</span>
                                <div>
                                    <h4>${action.title}</h4>
                                    <p>${action.desc}</p>
                                </div>
                                <span class="quick-card-link">${lang === 'ne' ? 'खोल्नुहोस्' : 'Open'} →</span>
                            </button>
                        `).join('')}
                    </div>
                </section>

                <section class="grid gap-6 lg:grid-cols-3">
                    <div class="info-panel card lg:col-span-2">
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                            <div>
                                <p class="tag-pill">${lang === 'ne' ? 'नवीनतम' : 'Latest'}</p>
                                <h3 class="page-section-title">${t('updatesHeading')}</h3>
                            </div>
                            <span class="text-sm text-slate-500">${formatDate(new Date())}</span>
                        </div>
                        <div class="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                            ${updates.length === 0 ? `<p class="text-center text-slate-500 py-8">${t('noNotices')}</p>` :
                    updates.map(n => `
                                <article class="update-card">
                                    <div class="flex items-center justify-between flex-wrap gap-2">
                                        <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">${formatDate(n.date)}</span>
                                        ${isNewNotice(n) ? `<span class="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">${lang === 'ne' ? 'नयाँ' : 'NEW'}</span>` : ''}
                                </div>
                                    <h4>${n.title}</h4>
                                    <p class="line-clamp-3">${n.content}</p>
                                    <button onclick="currentView='notices';render()" class="text-sm font-semibold text-blue-600 hover:text-blue-800">${t('viewDetails')} →</button>
                                </article>
                            `).join('')}
                        </div>
                    </div>
                    <div class="info-panel card">
                        <p class="tag-pill">${lang === 'ne' ? 'सहयोग डेस्क' : 'Support Desk'}</p>
                        <h3 class="page-section-title text-2xl">${lang === 'ne' ? 'नागरिक सहायता' : 'Citizen Support'}</h3>
                        <p class="text-slate-600 leading-relaxed">${lang === 'ne' ? 'आपतकालीन अवस्थामा तुरुन्त सम्पर्क गर्नुहोस् र सेवा समयबारे अद्यावधिक हुनुहोस्।' : 'Reach us immediately during emergencies and stay informed about service hours.'}</p>
                        <ul class="info-list mt-6">
                            <li>📞 <span class="font-semibold">${t('hotlineHeading')}</span>: <strong>${lang === 'ne' ? toNepaliDigits('1112') : '1112'}</strong></li>
                            <li>⏰ <span class="font-semibold">${t('serviceHoursHeading')}</span>: <strong>${t('serviceHoursValue')}</strong></li>
                            <li>📍 <span class="font-semibold">${t('addressHeading')}</span>: <strong>${t('officeAddress')}</strong></li>
                        </ul>
                        <div class="mt-6 flex flex-wrap gap-3">
                            <a href="tel:1112" class="btn-primary bg-blue-600 text-white text-base">${t('callNow')}</a>
                            <button type="button" onclick="currentView='contacts';render()" class="btn-secondary">${t('contacts')}</button>
                </div>
                    </div>
                </section>
            </div>
        </div>`;
        }

        function renderPopupMessage() {
            if (!popupMessage || popupOptOut || popupDismissed || !popupVisible) return '';
            return `
        <div id="popup-overlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all animate-slideUp">
                <div class="relative">
                    <button onclick="dismissPopup()" class="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    ${popupMessage.photo && popupMessage.photo.startsWith('data:image') ?
                    `<img src="${popupMessage.photo}" class="w-full h-64 object-cover">` :
                    `<div class="w-full h-48 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 flex items-center justify-center">
                            <svg class="w-24 h-24 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                            </svg>
                        </div>`
                }
                    <div class="p-8">
                        <h2 class="text-3xl font-extrabold text-gray-900 mb-4">${popupMessage.title || ''}</h2>
                        <p class="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">${popupMessage.content || ''}</p>
                        <div class="mb-4">
                            <label class="flex items-center gap-3 text-sm text-gray-600">
                                <input id="popup-optout" type="checkbox" class="w-4 h-4" ${popupOptOut ? 'checked' : ''}>
                                <span>${t('dontShowAgain')}</span>
                            </label>
                        </div>
                        <div class="flex justify-end">
                            <button onclick="dismissPopup()" class="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
                                ${t('close')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
        }

        function renderLatestNewsPopup() {
            if (currentView !== 'home' || latestNewsDismissed || notices.length === 0) return '';
            const latestNotice = notices[0];
            if (!latestNotice) return '';
            return `
        <div id="latest-news-overlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden transform transition-all animate-slideUp">
                <div class="relative">
                    <button onclick="dismissLatestNews()" class="absolute top-4 right-4 z-10 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
                        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
                        <div class="flex items-center gap-3 mb-2">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                            </svg>
                            <h2 class="text-2xl font-extrabold">${t('latestNews')}</h2>
                            ${isNewNotice(latestNotice) ? `<span class="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">${lang === 'ne' ? 'नयाँ' : 'NEW'}</span>` : ''}
                    </div>
                        <p class="text-blue-100 text-sm">${formatDate(latestNotice.date)}</p>
                </div>
                    ${latestNotice.photo && latestNotice.photo.startsWith('data:image') ?
                    `<img src="${latestNotice.photo}" class="w-full h-64 object-cover">` :
                    `<div class="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                            <svg class="w-24 h-24 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                        </div>`
                }
                    <div class="p-8">
                        <h3 class="text-3xl font-extrabold text-gray-900 mb-4">${latestNotice.title}</h3>
                        <p class="text-lg text-gray-700 leading-relaxed whitespace-pre-wrap mb-4 line-clamp-4">${latestNotice.content}</p>
                        <div class="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div class="text-sm text-gray-500">
                                <p>${t('publishedBy')}: ${latestNotice.publisher || adminName}</p>
                    </div>
                            <div class="flex gap-3">
                                <button onclick="dismissLatestNews();currentView='notices';render()" class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg">
                                    ${t('viewDetails')}
                                </button>
                                <button onclick="dismissLatestNews()" class="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-colors">
                                    ${t('close')}
                                </button>
                    </div>
            </div>
                    </div>
                </div>
            </div>
        </div>
        `;
        }

        function renderNotices() {
            return `<div class="max-w-6xl mx-auto py-12 px-6">
            <h2 class="text-4xl font-extrabold text-center mb-10 text-blue-700">${t('notices')}</h2>
            ${notices.length === 0 ? `<p class="text-center text-2xl text-gray-600 py-12">${t('noNotices')}</p>` :
                    `<div class="grid md:grid-cols-2 gap-6">
                ${notices.map(n => {
                        const noticeDate = new Date(n.date);
                        const dateStr = noticeDate.toISOString().split('T')[0];
                        const isNew = isNewNotice(n);
                        return `
                    <div class="card hover:shadow-xl transition-shadow ${isNew ? 'border-2 border-red-400' : ''}">
                        <div class="mb-4">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center gap-2">
                                    <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">${dateStr}</span>
                                    ${isNew ? `<span class="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">${lang === 'ne' ? '🔥 नयाँ' : '🔥 NEW'}</span>` : ''}
                                </div>
                                <span class="text-xs text-gray-500">${formatDate(n.date)}</span>
                            </div>
                            <h3 class="text-2xl font-bold text-blue-700 mb-3">${n.title}</h3>
                        </div>
                        ${n.photo ? (n.photo.startsWith('data:image') ?
                                `<img src="${n.photo}" class="w-full h-auto max-h-64 object-cover rounded-xl border border-gray-200 shadow-md mb-4">` :
                                `<div class="mb-4 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                                <div class="flex items-center gap-3">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                    </svg>
                                    <div>
                                        <p class="font-semibold text-blue-900">${lang === 'ne' ? 'अट्याचमेन्ट' : 'Attachment'}</p>
                                        <p class="text-sm text-blue-700">${lang === 'ne' ? 'फाइल थपिएको छ' : 'File attached'}</p>
                                    </div>
                                </div>
                            </div>`
                            ) : ''}
                        <p class="text-gray-700 whitespace-pre-wrap mb-4 leading-relaxed">${n.content}</p>
                        <div class="pt-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
                            <span class="flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                                ${n.publisher || adminName}
                            </span>
                    <span>${t('date')}: ${formatDate(n.date)}</span>
                </div>
                    </div>
                    `;
                    }).join('')}
            </div>`}
        </div>`;
        }

        function renderContacts() {
            return `<div class="max-w-6xl mx-auto py-12 px-6">
            <div class="text-center mb-12">
                <h2 class="text-4xl font-extrabold text-blue-700 mb-4">${t('contactInfoTitle')}</h2>
                <p class="text-lg text-gray-600">${t('homeTagline')}</p>
            </div>
            <div class="grid lg:grid-cols-3 gap-8">
                <div class="lg:col-span-2 space-y-8">
                    <div class="card bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                        <div class="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                            <div>
                                <p class="text-sm uppercase tracking-[0.4em] text-blue-400">${t('hotlineHeading')}</p>
                                <h3 class="text-4xl font-extrabold text-blue-900 mt-3">1112</h3>
                                <p class="text-gray-600 mt-2">${t('contactInfoTitle')}</p>
                            </div>
                            <a href="tel:1112" class="btn-primary bg-blue-600 text-white text-lg">${t('callNow')}</a>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-2xl font-bold text-slate-800 mb-4">${t('emergencyNumbersTitle')}</h3>
                        <div class="grid sm:grid-cols-2 gap-4">
                            ${emergencyContacts.map(contact => `
                                <div class="rounded-2xl border border-slate-200 p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div class="flex items-center gap-3 mb-3">
                                        <span class="text-3xl">${contact.icon}</span>
                                        <div>
                                            <p class="text-sm text-slate-500 uppercase tracking-wide">${contact.description[lang]}</p>
                                            <p class="text-2xl font-bold text-slate-900">${contact.number}</p>
                                        </div>
                                    </div>
                                    <a href="tel:${contact.number.replace(/[^0-9+]/g, '')}" class="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800">
                                        ${t('callNow')} →
                                    </a>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                <div class="space-y-6">
                    <div class="card">
                        <p class="text-sm uppercase tracking-[0.3em] text-slate-400">${t('addressHeading')}</p>
                        <h3 class="text-xl font-bold text-slate-900 mt-3">${t('officeAddress')}</h3>
                    </div>
                    <div class="card">
                        <p class="text-sm uppercase tracking-[0.3em] text-slate-400">${t('emailHeading')}</p>
                        <a href="mailto:${t('emailValue')}" class="text-xl font-bold text-blue-600 mt-3 block">${t('emailValue')}</a>
                    </div>
                    <div class="card">
                        <p class="text-sm uppercase tracking-[0.3em] text-slate-400">${t('serviceHoursHeading')}</p>
                        <p class="text-xl font-bold text-slate-900 mt-3">${t('serviceHoursValue')}</p>
                    </div>
                </div>
            </div>
        </div>`;
        }

        function renderSubmitQuery() {
            return `<div class="max-w-2xl mx-auto py-12 px-6">
            <div class="card">
                <h2 class="text-4xl font-extrabold text-center mb-10">${t('submitQuery')}</h2>
                <form onsubmit="event.preventDefault();submitQuery()">
                    <div class="grid md:grid-cols-2 gap-6 mb-6">
                        <div class="text-left">
                            <label class="block text-sm font-semibold text-slate-600 mb-2">${t('citizenName')}</label>
                            <input type="text" id="qname" placeholder="${t('citizenNamePlaceholder')}" required class="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200" aria-label="${t('citizenName')}">
                        </div>
                        <div class="text-left">
                            <label class="block text-sm font-semibold text-slate-600 mb-2">${t('citizenLocation')}</label>
                            <input type="text" id="qlocation" placeholder="${t('citizenLocationPlaceholder')}" required class="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200" aria-label="${t('citizenLocation')}">
                        </div>
                    </div>
                    <input type="text" id="qsubject" placeholder="${t('querySubject')}" required class="w-full border border-gray-300 rounded-2xl px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-200">
                    <textarea id="qmessage" rows="6" placeholder="${t('yourProblem')}" required class="w-full border border-gray-300 rounded-2xl px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-200"></textarea>
                    
                    <div class="text-center p-6 bg-blue-50 rounded-2xl">
                        <div class="relative bg-white rounded-2xl border-2 border-dashed border-blue-200 min-h-[220px] flex items-center justify-center overflow-hidden">
                            <video id="video-feed" class="${cameraStream ? 'block' : 'hidden'} w-full h-auto object-cover" playsinline autoplay muted></video>
                            <canvas id="canvas" style="display:none;"></canvas>
                            ${capturedImage ? `<img src="${capturedImage}" class="w-full h-auto max-h-64 object-cover rounded-2xl">` : ''}
                            ${(!cameraStream && !capturedImage) ? `
                                <div class="text-blue-600">
                                    <svg class="mx-auto mb-4" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h4l2-3h4l2 3h4v12H4z"/><circle cx="12" cy="13" r="3"/><path d="M4 17l4-4 1 1 3-3 4 4 2-2 2 2"/></svg>
                                    <p class="text-lg font-semibold">${t('photoInstructions')}</p>
                                </div>
                            ` : ''}
                        </div>
                        <input type="file" id="file-upload" accept="image/*" class="hidden" onchange="handleFileUpload(event)">
                        <p id="cam-status" class="mt-4 text-lg font-medium text-blue-800"></p>
                        <div class="mt-6 flex flex-wrap gap-4 justify-center">
                            <button type="button" onclick="startCamera()" class="btn-primary bg-blue-600 text-white text-xl">${t('takeLivePhoto')}</button>
                            <button type="button" onclick="document.getElementById('file-upload').click()" class="btn-primary bg-emerald-600 text-white text-xl">${t('chooseFromDevice')}</button>
                            ${cameraStream ? `<button type="button" onclick="capturePhoto()" class="btn-primary bg-orange-600 text-white text-xl">${t('capture')}</button>` : ''}
                            ${capturedImage ? `<button type="button" onclick="capturedImage=null;render()" class="btn-primary bg-gray-600 text-white text-xl">${t('recapture')}</button>` : ''}
                        </div>
                        ${capturedImage ? `<p class="mt-4 text-base text-gray-600">${t('photoReady')}</p>` : ''}
                    </div>
                    
                    <button type="submit" class="btn-primary bg-green-600 text-white w-full text-2xl mt-8">${t('submit')}</button>
                </form>
            </div>
        </div>`;
        }

        function renderMyQueries() {
            queries = JSON.parse(localStorage.getItem('queries') || '[]');
            const myQueriesList = queries.filter(q => userQueries.includes(q.id));
            return `<div class="max-w-4xl mx-auto py-12 px-6">
            <h2 class="text-4xl font-extrabold text-center mb-10">${t('myQueriesTitle')}</h2>
            ${myQueriesList.length === 0 ? `<p class="text-center text-2xl text-gray-600">${t('noMyQueries')}</p>` :
                    myQueriesList.map(q => `
                <div class="card mb-8">
                    <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                            <h3 class="text-3xl font-bold text-blue-600 mb-2">${q.subject}</h3>
                            <p class="text-sm text-gray-500">${t('queryDate')}: ${formatDate(q.date)}</p>
                            <div class="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                                <span>📍 ${q.location || t('unknownLocation')}</span>
                            </div>
                        </div>
                        <div class="flex flex-col items-end gap-2">
                            ${q.reply ?
                            `<span class="px-4 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">${t('replied')}</span>` :
                            `<span class="px-4 py-1 rounded-full text-sm font-semibold bg-amber-100 text-amber-700">${t('waitingForReply')}</span>`
                        }
                        </div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-4 mb-4">
                        <p class="text-lg text-slate-700 leading-relaxed whitespace-pre-wrap">${q.message}</p>
                    </div>
                    ${q.photo ? `<img src="${q.photo}" class="mb-4 max-h-64 w-full object-cover rounded-2xl border border-gray-200 shadow-md">` : ''}
                    ${q.reply ? `
                        <div class="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-r-xl shadow-sm">
                            <div class="flex items-center gap-2 mb-3">
                                <span class="text-lg font-bold text-blue-700">${t('adminReply')}</span>
                                <span class="text-xs text-blue-600">${formatDate(q.replyDate || q.date)}</span>
                            </div>
                            <p class="text-slate-800 leading-relaxed whitespace-pre-wrap text-lg">${q.reply}</p>
                        </div>
                    ` : `
                        <div class="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl">
                            <p class="text-amber-700 font-medium">${t('noReply')}</p>
                        </div>
                    `}
                </div>
            `).join('')}
        </div>`;
        }

        function renderAdminLogin() {
            return `<div class="max-w-md mx-auto py-20">
            <div class="card text-center">
                <h2 class="text-4xl font-extrabold mb-8">${t('adminLogin')}</h2>
                <form onsubmit="event.preventDefault();adminLogin()">
                    <input type="text" id="auser" placeholder="${t('username')}" class="w-full border border-gray-300 mb-6" required>
                    <input type="password" id="apass" placeholder="${t('password')}" class="w-full border border-gray-300 mb-8" required>
                    <button type="submit" class="btn-primary bg-blue-600 text-white w-full text-2xl">${t('loginButton')}</button>
                </form>
            </div>
        </div>`;
        }

        function renderAdminDashboard() {
            const newQueries = queries.filter(q => q.status === 'new').length;
            const workspaceView = currentView === 'queries' ? 'queries' : 'publish';
            const recentQueries = queries.slice(0, 3);
            return `<div class="bg-slate-50 min-h-screen">
            <div class="max-w-7xl mx-auto py-12 px-6 space-y-10">
                <div class="grid xl:grid-cols-3 gap-8">
                    <div class="xl:col-span-2 bg-white rounded-2xl text-slate-900 p-6 shadow-sm border border-slate-200">
                        <p class="text-xs uppercase tracking-wider text-slate-500">${t('welcomeBack')}, ${adminName}</p>
                        <h2 class="text-2xl md:text-3xl font-semibold mt-2">${t('adminDashboardTitle')}</h2>
                        <p class="mt-2 text-sm text-slate-600">${t('adminSubtitle')}</p>
                        <div class="mt-6 grid md:grid-cols-3 gap-3">
                            <div class="bg-gray-50 rounded-md px-3 py-3 border border-slate-100">
                                <p class="text-xs text-slate-500">${t('totalNotices')}</p>
                                <p class="text-lg font-semibold mt-1 text-slate-900">${notices.length}</p>
                            </div>
                            <div class="bg-gray-50 rounded-md px-3 py-3 border border-slate-100">
                                <p class="text-xs text-slate-500">${t('totalQueries')}</p>
                                <p class="text-lg font-semibold mt-1 text-slate-900">${queries.length}</p>
                            </div>
                            <div class="bg-gray-50 rounded-md px-3 py-3 border border-slate-100">
                                <p class="text-xs text-slate-500">${t('pendingQueries')}</p>
                                <p class="text-lg font-semibold mt-1 text-amber-700">${newQueries}</p>
                            </div>
                        </div>
                        <div class="mt-6 flex flex-wrap gap-3">
                            <button onclick="openNoticeEditor()" class="px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">${t('publishNotice')}</button>
                            <button onclick="currentView='manageNotices';render()" class="px-3 py-2 rounded-md bg-gray-100 text-slate-700 text-sm font-medium hover:bg-gray-200 transition">${t('manageNotices')}</button>
                            <button onclick="openHeroManager()" class="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition">${lang==='ne' ? 'फोटो व्यवस्थापन' : 'Manage Hero Photo'}</button>
                            <button onclick="currentView='queries';render()" class="px-3 py-2 rounded-md bg-white border border-slate-200 text-sm font-medium hover:bg-slate-50 transition">
                                ${t('viewQueries')} ${newQueries ? `<span class="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-sm font-semibold">${newQueries}</span>` : ''}
                            </button>
                        </div>
                    </div>
                    <div class="space-y-6">
                        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <p class="text-sm uppercase tracking-[0.4em] text-slate-400">${t('totalQueries')}</p>
                            <div class="mt-6 space-y-4">
                                <div class="flex items-center justify-between p-4 rounded-2xl bg-blue-50 border border-blue-100">
                                    <div>
                                        <p class="text-sm text-blue-800">${t('totalNotices')}</p>
                                        <p class="text-2xl font-bold text-blue-900">${notices.length}</p>
                                    </div>
                                    <span class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-inner text-blue-600 font-bold">N</span>
                                </div>
                                <div class="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                                    <div>
                                        <p class="text-sm text-emerald-800">${t('totalQueries')}</p>
                                        <p class="text-2xl font-bold text-emerald-900">${queries.length}</p>
                                    </div>
                                    <span class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-inner text-emerald-600 font-bold">Q</span>
                                </div>
                                <div class="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-100">
                                    <div>
                                        <p class="text-sm text-amber-800">${t('pendingQueries')}</p>
                                        <p class="text-2xl font-bold text-amber-900">${newQueries}</p>
                                    </div>
                                    <span class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-inner text-amber-600 font-bold">!</span>
                                </div>
                            </div>
                        </div>
                        <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                            <p class="text-sm font-semibold text-slate-500 uppercase tracking-[0.3em]">${t('quickActions')}</p>
                            <div class="mt-5 space-y-4">
                                <button onclick="openNoticeEditor()" class="w-full flex items-center justify-between px-3 py-2 rounded-md border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition text-sm">
                                    <span class="font-semibold text-slate-800">${t('publishNotice')}</span>
                                    <span class="text-xs text-slate-500">↗</span>
                                </button>
                                <button onclick="currentView='manageNotices';render()" class="w-full flex items-center justify-between px-3 py-2 rounded-md border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 transition text-sm">
                                    <span class="font-semibold text-slate-800">${t('manageNotices')}</span>
                                    <span class="text-xs text-slate-500">↗</span>
                                </button>
                                <button onclick="openHeroManager()" class="w-full flex items-center justify-between px-3 py-2 rounded-md border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition text-sm">
                                    <span class="font-semibold text-slate-800">${lang==='ne' ? 'फोटो व्यवस्थापन' : 'Manage Hero Photo'}</span>
                                    <span class="text-xs text-slate-500">↗</span>
                                </button>
                                <button onclick="currentView='queries';render()" class="w-full flex items-center justify-between px-3 py-2 rounded-md border border-slate-200 hover:border-purple-500 hover:bg-purple-50 transition text-sm">
                                    <span class="font-semibold text-slate-800">${t('viewQueries')}</span>
                                    <span class="text-xs text-slate-500">↗</span>
                                </button>
                                <button onclick="currentView='managePopup';render()" class="w-full flex items-center justify-between px-3 py-2 rounded-md border border-slate-200 hover:border-teal-500 hover:bg-teal-50 transition text-sm">
                                    <span class="font-semibold text-slate-800">${t('managePopup')}</span>
                                    <span class="text-xs text-slate-500">↗</span>
                                </button>
                                <button onclick="adminLogout()" class="w-full flex items-center justify-between px-3 py-2 rounded-md border border-red-200 bg-red-50 hover:border-red-500 hover:bg-red-100 transition text-sm">
                                    <span class="font-semibold text-red-700">${t('logout')}</span>
                                    <span class="text-xs text-red-500">↗</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="grid lg:grid-cols-3 gap-8">
                    <div class="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                        <div class="flex flex-wrap items-center justify-between gap-4 mb-10">
                            <div class="flex items-center gap-3 bg-slate-100 rounded-full p-1">
                                <button onclick="openNoticeEditor()" class="px-5 py-2 rounded-full text-sm font-semibold ${workspaceView === 'publish' ? 'bg-white shadow text-blue-700' : 'text-slate-500'}">${t('noticeEditor')}</button>
                                <button onclick="currentView='queries';render()" class="px-5 py-2 rounded-full text-sm font-semibold ${workspaceView === 'queries' ? 'bg-white shadow text-purple-700' : 'text-slate-500'}">${t('queryBoard')}</button>
                            </div>
                            ${workspaceView === 'publish' ? `<span class="text-sm text-slate-500">${editingNoticeId ? t('updateNotice') : t('publishNotice')}</span>` : `<span class="text-sm text-slate-500">${lang === 'ne' ? `प्रश्नहरू (${newQueries} नयाँ)` : `Queries (${newQueries} New)`}</span>`}
                        </div>
                        ${workspaceView === 'publish' ? `
                            <div class="space-y-6">
                                <div class="text-left">
                                    <label class="block text-sm font-semibold text-slate-600 mb-2">${t('noticeTitle')}</label>
                                    <input type="text" id="ntitle" value="${(noticeDraft.title || '').replace(/"/g, '&quot;')}" oninput="updateNoticeDraft('title', this.value)" placeholder="${t('noticeTitle')}" class="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200">
                                </div>
                                <div class="text-left">
                                    <label class="block text-sm font-semibold text-slate-600 mb-2">${t('content')}</label>
                                    <textarea id="ncontent" rows="8" placeholder="${t('content')}" oninput="updateNoticeDraft('content', this.value)" class="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200">${noticeDraft.content || ''}</textarea>
                                </div>
                                <div class="text-left">
                                    <label class="block text-sm font-semibold text-slate-600 mb-2">${t('addPhotoOrFile')}</label>
                                    <div class="text-center p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <input type="file" id="notice-file-upload" accept="image/*,.pdf,.doc,.docx" class="hidden" onchange="handleNoticeFileUpload(event)">
                                        ${noticePhoto ? `
                                            <div class="relative">
                                                ${noticePhoto.startsWith('data:image') ?
                            `<img src="${noticePhoto}" class="w-full h-auto max-h-64 object-cover rounded-2xl mb-4">` :
                            `<div class="p-8 bg-blue-50 rounded-2xl mb-4">
                                                        <svg class="mx-auto mb-2" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                            <polyline points="14 2 14 8 20 8"></polyline>
                                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                                            <polyline points="10 9 9 9 8 9"></polyline>
                                                        </svg>
                                                        <p class="text-sm font-semibold text-blue-700">${t('photoReady')}</p>
                                                    </div>`
                        }
                                                <button type="button" onclick="noticePhoto=null;render()" class="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition">${t('removePhoto')}</button>
                                            </div>
                                        ` : `
                                            <div class="text-slate-600">
                                                <svg class="mx-auto mb-3" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                                    <path d="M4 7h4l2-3h4l2 3h4v12H4z"/><circle cx="12" cy="13" r="3"/><path d="M4 17l4-4 1 1 3-3 4 4 2-2 2 2"/>
                                                </svg>
                                                <p class="text-sm font-semibold mb-3">${t('noticePhotoInstructions')}</p>
                                            </div>
                                        `}
                                        <button type="button" onclick="document.getElementById('notice-file-upload').click()" class="btn-primary bg-blue-600 text-white text-lg">${noticePhoto ? t('chooseFromDevice') : t('addPhotoOrFile')}</button>
                                    </div>
                                </div>
                                <button onclick="publishNotice()" class="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-xl font-bold shadow-lg hover:opacity-95 transition">${editingNoticeId ? t('updateNotice') : t('publishNotice')}</button>
                            </div>
                        ` : `
                            <div class="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                                ${queries.length === 0 ? `<p class="text-center text-xl text-slate-500">${t('noQueries')}</p>` :
                    queries.map(q => `
                                    <div class="rounded-2xl border border-slate-200 p-6 bg-slate-50 shadow-sm">
                                        <div class="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <h4 class="text-2xl font-semibold text-slate-900">${q.subject}</h4>
                                                <p class="text-sm text-slate-500 mt-1">${formatDate(q.date)}</p>
                                                <div class="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                                                    <span>👤 ${q.userName || t('anonymousUser')}</span>
                                                    <span>📍 ${q.location || t('unknownLocation')}</span>
                                                </div>
                                            </div>
                                            <div class="flex flex-col items-end gap-2">
                                                <span class="px-4 py-1 rounded-full text-sm font-semibold ${q.status === 'new' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">${q.status === 'new' ? t('new') : t('seen')}</span>
                                                ${q.reply ? `<span class="px-4 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">${t('replied')}</span>` : ''}
                                            </div>
                                        </div>
                                        <p class="mt-4 text-slate-700 leading-relaxed">${q.message}</p>
                                        ${q.photo ? `<img src="${q.photo}" class="mt-4 max-h-64 w-full object-cover rounded-2xl border border-white shadow-md">` : ''}
                                        ${q.reply ? `
                                            <div class="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl">
                                                <div class="flex items-center gap-2 mb-2">
                                                    <span class="text-sm font-bold text-blue-700">${t('adminReply')}</span>
                                                    <span class="text-xs text-blue-600">${formatDate(q.replyDate || q.date)}</span>
                                                </div>
                                                <p class="text-slate-800 leading-relaxed whitespace-pre-wrap">${q.reply}</p>
                                            </div>
                                        ` : `
                                            <div class="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-xl">
                                                <p class="text-sm text-amber-700">${t('noReply')}</p>
                                            </div>
                                        `}
                                        <div class="mt-6 space-y-4">
                                            ${!q.reply ? `
                                                <div class="border-t border-slate-200 pt-4">
                                                    <label class="block text-sm font-semibold text-slate-700 mb-2">${t('reply')}</label>
                                                    <textarea id="reply-${q.id}" rows="4" placeholder="${t('replyPlaceholder')}" class="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"></textarea>
                                                    <button onclick="submitReply('${q.id}')" class="mt-3 px-6 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition">
                                                        ${t('submitReply')}
                                                    </button>
                                                </div>
                                            ` : ''}
                                            <div class="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200">
                                                <small class="text-slate-500">#${q.userId}</small>
                                                <button onclick="toggleStatus('${q.id}')" class="px-5 py-2 rounded-full text-sm font-semibold ${q.status === 'new' ? 'bg-green-600 text-white' : 'bg-yellow-500 text-slate-900'}">
                                                    ${q.status === 'new' ? t('queryStatusUpdate') : t('queryStatusUpdateBack')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        `}
                    </div>
                    ${currentView === 'manageNotices' ? `
                        <div class="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                            <h3 class="text-3xl font-bold text-slate-900 mb-8">${t('manageNotices')}</h3>
                            <div class="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                                ${notices.length === 0 ? `<p class="text-center text-xl text-slate-500">${t('noNotices')}</p>` :
                        notices.map((n, idx) => {
                            if (!n.id) n.id = Date.now() + idx;
                            const noticeId = n.id || idx;
                            return `
                                    <div class="rounded-2xl border border-slate-200 p-6 bg-slate-50 shadow-sm">
                                        <div class="flex flex-wrap items-start justify-between gap-4 mb-4">
                                            <div class="flex-1">
                                                <h4 class="text-2xl font-semibold text-slate-900 mb-2">${n.title}</h4>
                                                <p class="text-sm text-slate-500">${t('publishedBy')}: ${n.publisher || adminName} • ${t('date')}: ${formatDate(n.date)}</p>
                                            </div>
                                            <div class="flex gap-3">
                                                <button onclick="editNotice('${noticeId}')" class="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition">${t('editNotice')}</button>
                                                <button onclick="confirmDeleteNotice('${noticeId}')" class="px-5 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition">${t('deleteNotice')}</button>
                                            </div>
                                        </div>
                                        <p class="text-slate-700 leading-relaxed whitespace-pre-wrap">${n.content}</p>
                                        ${n.photo ? (n.photo.startsWith('data:image') ?
                                    `<img src="${n.photo}" class="mt-4 w-full h-auto max-h-64 object-cover rounded-2xl border border-gray-200 shadow-md">` :
                                    `<div class="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                                                <div class="flex items-center gap-2">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-blue-600">
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                        <polyline points="14 2 14 8 20 8"></polyline>
                                                    </svg>
                                                    <p class="text-sm font-semibold text-blue-900">${lang === 'ne' ? 'अट्याचमेन्ट' : 'Attachment'}</p>
                                                </div>
                                            </div>`
                                ) : ''}
                                    </div>
                                `;
                        }).join('')}
                            </div>
                        </div>
                    ` : ''}
                    ${currentView === 'manageHero' ? `
                        <div class="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                            <h3 class="text-3xl font-bold text-slate-900 mb-6">${lang==='ne' ? 'मुख्य फोटो व्यवस्थापन' : 'Manage Hero Photo'}</h3>
                            <div class="space-y-6">
                                <div class="grid md:grid-cols-2 gap-6">
                                    <div class="text-left md:col-span-2">
                                        <label class="block text-sm font-semibold text-slate-600 mb-2" for="hero-caption">${lang==='ne' ? 'फोटो शीर्षक (वैकल्पिक)' : 'Photo caption (optional)'}</label>
                                        <input type="text" id="hero-caption" value="${heroDraft.caption || ''}" oninput="updateHeroDraft('caption', this.value)" placeholder="${lang==='ne' ? 'जस्तै: सेवा शिविर सूचना' : 'e.g. Service camp announcement'}" class="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200">
                                    </div>
                                </div>
                                <div class="text-left">
                                    <label class="block text-sm font-semibold text-slate-600 mb-2">${lang==='ne' ? 'स्लाइड फोटो' : 'Slide photo'}</label>
                                    <div class="text-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <input type="file" id="hero-file-upload" accept="image/*" class="hidden" onchange="handleHeroFileUpload(event)">
                                        ${heroDraft.photo ? `
                                            <div class="mb-4">
                                                <img src="${heroDraft.photo}" class="w-full h-auto max-h-64 object-cover rounded-2xl border border-slate-200 shadow-md" alt="hero-preview">
                                            </div>
                                            <div class="flex flex-wrap gap-3 justify-center">
                                                <button type="button" onclick="document.getElementById('hero-file-upload').click()" class="btn-primary bg-blue-600 text-white text-base">${lang==='ne' ? 'फोटो बदल्नुहोस्' : 'Change photo'}</button>
                                                <button type="button" onclick="clearHeroDraftPhoto()" class="btn-secondary text-sm">${lang==='ne' ? 'फोटो हटाउनुहोस्' : 'Remove photo'}</button>
                                            </div>
                                        ` : `
                                            <div class="text-slate-500 mb-4">
                                                <svg class="mx-auto mb-3" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                                    <path d="M4 7h4l2-3h4l2 3h4v12H4z"/><circle cx="12" cy="13" r="3"/><path d="M4 17l4-4 1 1 3-3 4 4 2-2 2 2"/>
                                                </svg>
                                                <p class="font-semibold">${lang==='ne' ? 'फोटो छान्दा मात्र प्रकाशित गर्न सकिन्छ' : 'Choose an image to publish the slide'}</p>
                                            </div>
                                            <button type="button" onclick="document.getElementById('hero-file-upload').click()" class="btn-primary bg-emerald-600 text-white text-base">${lang==='ne' ? 'फोटो छान्नुहोस्' : 'Choose photo'}</button>
                                        `}
                                    </div>
                                </div>
                                <div class="pt-2">
                                    <button onclick="saveHeroBanner()" class="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-lg font-semibold shadow-lg hover:opacity-95 transition">${lang==='ne' ? 'फोटो प्रकाशित गर्नुहोस्' : 'Publish photo'}</button>
                                </div>
                                <div class="mt-2 text-sm text-slate-500">${lang==='ne' ? 'प्रकाशित स्लाइड तुरुन्त होम पेजमा देखिन्छ।' : 'Published slides appear on the home page instantly.'}</div>
                                <div class="pt-4">
                                    <button onclick="currentView='adminDashboard';render()" class="px-4 py-2 rounded-md bg-gray-100 text-slate-700">${lang==='ne' ? 'बन्द गर्नुहोस्' : 'Close'}</button>
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    ${currentView === 'managePopup' ? `
                        <div class="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                            <h3 class="text-3xl font-bold text-slate-900 mb-8">${t('managePopup')}</h3>
                            <div class="space-y-6">
                                <div class="text-left">
                                    <label class="block text-sm font-semibold text-slate-600 mb-2">${t('popupTitle')}</label>
                                    <input type="text" id="popup-title" placeholder="${t('popupTitle')}" value="${popupMessage ? (popupMessage.title || '') : ''}" class="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200">
                                </div>
                                <div class="text-left">
                                    <label class="block text-sm font-semibold text-slate-600 mb-2">${t('popupContent')}</label>
                                    <textarea id="popup-content" rows="6" placeholder="${t('popupContent')}" class="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200">${popupMessage ? (popupMessage.content || '') : ''}</textarea>
                                </div>
                                <div class="text-left">
                                    <label class="block text-sm font-semibold text-slate-600 mb-2">${t('addPhotoOrFile')}</label>
                                    <div class="text-center p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <input type="file" id="popup-file-upload" accept="image/*" class="hidden" onchange="handlePopupFileUpload(event)">
                                        ${popupPhoto || (popupMessage && popupMessage.photo) ? `
                                            <div class="relative">
                                                <img src="${popupPhoto || (popupMessage && popupMessage.photo)}" class="w-full h-auto max-h-64 object-cover rounded-2xl mb-4">
                                                <button type="button" onclick="popupPhoto=null;render()" class="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition">${t('removePhoto')}</button>
                                            </div>
                                        ` : `
                                            <div class="text-slate-600">
                                                <svg class="mx-auto mb-3" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                                    <path d="M4 7h4l2-3h4l2 3h4v12H4z"/><circle cx="12" cy="13" r="3"/>
                                                </svg>
                                                <p class="text-sm font-semibold mb-3">${t('noticePhotoInstructions')}</p>
                                            </div>
                                        `}
                                        <button type="button" onclick="document.getElementById('popup-file-upload').click()" class="btn-primary bg-blue-600 text-white text-lg">${t('chooseFromDevice')}</button>
                                    </div>
                                </div>
                                <div class="flex gap-4">
                                    <button onclick="setPopupMessage()" class="flex-1 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-xl font-bold shadow-lg hover:opacity-95 transition">${t('setPopupMessage')}</button>
                                    ${popupMessage ? `<button onclick="clearPopupMessage()" class="px-6 py-4 rounded-2xl bg-red-600 text-white text-xl font-bold shadow-lg hover:bg-red-700 transition">${t('clearPopup')}</button>` : ''}
                                </div>
                                ${popupMessage ? `
                                    <div class="mt-6 p-6 bg-green-50 border border-green-200 rounded-2xl">
                                        <p class="text-green-800 font-semibold mb-2">${lang === 'ne' ? 'वर्तमान पपअप सन्देश:' : 'Current Popup Message:'}</p>
                                        <p class="text-green-700"><strong>${popupMessage.title || ''}</strong></p>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    ` : ''}
                    <div class="space-y-6">
                        <form onsubmit="event.preventDefault();saveMovingText()" class="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                            <div class="flex items-center justify-between mb-4">
                                <div>
                                    <p class="text-xs uppercase tracking-widest text-blue-500">${lang === 'ne' ? 'मुभिङ अनुभाग' : 'Marquee Section'}</p>
                                    <h3 class="text-2xl font-bold text-slate-900 mt-1">${lang === 'ne' ? 'सूचना ब्यानर' : 'Scrolling Banner'}</h3>
                                </div>
                                <span class="text-xs text-slate-400">${lang === 'ne' ? 'अलग फारम' : 'Separate form'}</span>
                            </div>
                            <label class="text-sm font-semibold text-slate-600 mb-2 block" for="moving-ne">${lang === 'ne' ? 'नेपाली पाठ' : 'Nepali Text'}</label>
                            <textarea id="moving-ne" rows="2" class="w-full border border-slate-200 rounded-md px-3 py-2 mb-4" placeholder="${lang === 'ne' ? 'नेपाली सन्देश लेख्नुहोस्' : 'Write the Nepali message'}">${movingText.ne || ''}</textarea>
                            <label class="text-sm font-semibold text-slate-600 mb-2 block" for="moving-en">${lang === 'ne' ? 'अंग्रेजी पाठ' : 'English Text'}</label>
                            <textarea id="moving-en" rows="2" class="w-full border border-slate-200 rounded-md px-3 py-2 mb-4" placeholder="${lang === 'ne' ? 'अंग्रेजी सन्देश लेख्नुहोस्' : 'Write the English message'}">${movingText.en || ''}</textarea>
                            <div class="flex flex-wrap gap-3">
                                <button type="submit" class="px-4 py-2 rounded-md bg-blue-600 text-white font-semibold">${lang === 'ne' ? 'सेभ गर्नुहोस्' : 'Save'}</button>
                                <button type="button" onclick="resetMovingText()" class="px-4 py-2 rounded-md bg-gray-100 text-slate-700">${lang === 'ne' ? 'रिसेट' : 'Reset'}</button>
                            </div>
                        </form>
                    <div class="bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                        <div class="flex items-center justify-between mb-6">
                                <div>
                                    <p class="text-xs uppercase tracking-widest text-purple-500">${lang === 'ne' ? 'प्रश्न अनुभाग' : 'Query Section'}</p>
                                    <h3 class="text-2xl font-bold text-slate-900 mt-1">${t('latestQueries')}</h3>
                                </div>
                            <button onclick="currentView='queries';render()" class="text-sm font-semibold text-blue-600 hover:underline">${t('viewAllQueries')}</button>
                        </div>
                        ${recentQueries.length === 0 ? `<p class="text-slate-500">${t('noRecentQueries')}</p>` :
                    recentQueries.map(q => {
                        const preview = q.message.length > 160 ? q.message.slice(0, 160) + '…' : q.message;
                        return `
                                <div class="border-b border-slate-100 py-5 last:border-b-0">
                                    <p class="font-semibold text-slate-900">${q.subject}</p>
                                    <p class="text-xs text-slate-500 mt-1">${formatDate(q.date)}</p>
                                    <p class="text-xs text-slate-500 mt-1">👤 ${q.userName || t('anonymousUser')} • 📍 ${q.location || t('unknownLocation')}</p>
                                    <p class="text-sm text-slate-600 mt-3">${preview}</p>
                                    <div class="mt-3 flex flex-wrap gap-2">
                                        <span class="inline-flex px-3 py-1 rounded-full text-xs ${q.status === 'new' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">${q.status === 'new' ? t('new') : t('seen')}</span>
                                        ${q.reply ? `<span class="inline-flex px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">${t('replied')}</span>` : ''}
                                    </div>
                                </div>
                            `;
                    }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        }

        function renderLanguageModal() {
            if (!showLanguageModal) return '';
            return `
        <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
            <div class="bg-white rounded-3xl max-w-xl w-full p-10 text-center shadow-2xl border border-blue-100">
                <div class="flex items-center justify-center mb-6">
                    ${renderEmblem()}
                    <span class="text-3xl font-extrabold text-gray-900 ml-3">${t('appName')}</span>
                </div>
                <h3 class="text-3xl font-bold text-blue-700 mb-4">${t('chooseLanguageTitle')}</h3>
                <p class="text-lg text-gray-600 mb-8">${t('chooseLanguageSubtitle')}</p>
                <div class="flex flex-col gap-4">
                    <button onclick="setLanguage('ne')" class="w-full py-4 rounded-2xl border-2 border-blue-200 font-semibold text-xl hover:bg-blue-50">${t('nepaliLabel')}</button>
                    <button onclick="setLanguage('en')" class="w-full py-4 rounded-2xl border-2 border-blue-200 font-semibold text-xl hover:bg-blue-50">${t('englishLabel')}</button>
                </div>
                <p class="mt-6 text-sm text-gray-500 uppercase tracking-widest">${t('chooseLanguageCTA')}</p>
            </div>
        </div>`;
        }

        function toNepaliDigits(input) {
            if (!input && input !== 0) return '';
            const map = { '0': '०', '1': '१', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९' };
            return String(input).split('').map(ch => map[ch] || ch).join('');
        }

        function renderSupportCenter() {
            // Accordion style: each section (staff / emergency) is a collapsible panel
            return `
        <div class="max-w-6xl mx-auto py-12 px-6">
            <div class="text-center mb-6">
                <h2 class="text-4xl font-extrabold text-blue-700 mb-2">${t('support')}</h2>
                <p class="text-lg text-gray-600">${lang === 'ne' ? 'तत्काल सहयोगका लागि सबै हाटलाइनहरू र संसाधनहरू' : 'All hotlines and immediate support resources'}</p>
            </div>

            <div class="support-accordion">
                <div class="section ${supportAccordion.staff ? 'open' : ''}" id="support-staff">
                    <div class="head" onclick="toggleSupportSection('staff')">
                        <h4>${lang === 'ne' ? 'कर्मचारी विवरण' : 'Staff Details'}</h4>
                        <div class="chev">▾</div>
                    </div>
                    <div class="body">
                        <div class="mb-4">
                            <div class="flex items-center gap-2">
                                <input oninput="setStaffFilter(this.value)" value="${staffFilter}" placeholder="${lang === 'ne' ? 'नाम वा पदले खोज्नुहोस्' : 'Search by name or role'}" class="w-full border border-slate-200 rounded-lg px-3 py-2" />
                                <button onclick="setStaffFilter('')" class="px-3 py-2 bg-gray-100 rounded-lg">${lang === 'ne' ? 'खाली' : 'Clear'}</button>
                            </div>
                        </div>
                        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${(() => {
                    const q = (staffFilter || '').toLowerCase().trim();
                    const filtered = q ? staffContacts.filter(s => s.name.toLowerCase().includes(q) || s.role[lang].toLowerCase().includes(q)) : staffContacts;
                    return filtered.map(s => `
                                    <div class="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
                                        <div class="flex items-start gap-3">
                                            <img src="${s.photo || avatarDataURL(s.name)}" alt="${s.name}" class="w-12 h-12 rounded-full object-cover" />
                                            <div>
                                                <div class="text-lg font-semibold">${s.name}</div>
                                                <div class="text-sm text-slate-500">${s.role[lang]}</div>
                                                <div class="text-sm text-blue-700 font-medium mt-2">${s.phone}</div>
                                                <div class="text-sm text-slate-500">${s.email}</div>
                                                <div class="mt-3 flex gap-2">
                                                    <a href="tel:${s.phone.replace(/[^0-9+]/g, '')}" class="px-3 py-2 bg-green-600 text-white rounded-md text-sm">${t('callNow')}</a>
                                                    <a href="mailto:${s.email}" class="px-3 py-2 bg-gray-100 text-slate-700 rounded-md text-sm">Email</a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('');
                })()}
                        </div>
                    </div>
                </div>

                <div class="section ${supportAccordion.emergency ? 'open' : ''}" id="support-emergency">
                    <div class="head" onclick="toggleSupportSection('emergency')">
                        <h4>${lang === 'ne' ? 'आपतकालीन नम्बर' : 'Emergency Numbers'}</h4>
                        <div class="chev">▾</div>
                    </div>
                    <div class="body">
                        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            ${emergencyContacts.map(c => `
                                <div class="p-4 bg-white rounded-lg border border-slate-100 shadow-sm">
                                    <div class="flex items-start gap-3">
                                        <div class="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">${c.icon}</div>
                                        <div>
                                            <div class="text-lg font-semibold">${c.description[lang]}</div>
                                            <div class="text-sm text-slate-500">${lang === 'ne' ? 'हॉटलाइन' : 'Hotline'}</div>
                                            <div class="text-xl text-blue-700 font-bold mt-2">${c.number}</div>
                                            <div class="text-sm text-slate-500">${toNepaliDigits(c.number)}</div>
                                            <div class="mt-3 flex gap-2">
                                                <a href="tel:${c.number.replace(/[^0-9+]/g, '')}" class="px-3 py-2 bg-green-600 text-white rounded-md text-sm">${t('callNow')}</a>
                                                <button onclick="navigator.clipboard?.writeText('${c.number}')" class="px-3 py-2 bg-gray-100 text-slate-700 rounded-md text-sm">${lang === 'ne' ? 'नक्कल गर्नुहोस्' : 'Copy'}</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-8 text-sm text-slate-500 text-center">${lang === 'ne' ? 'यदि यो आपतकालीन स्थिति हो भने नजिकको प्रहरी चौकी वा अस्पतालमा तुरुन्त सम्पर्क गर्नुहोस्।' : 'If this is an emergency, contact your nearest police station or hospital immediately.'}</div>
        </div>`;
        }

        function render() {
            document.documentElement.lang = lang === 'ne' ? 'ne' : 'en';
            document.title = t('appName');
            const content = role === 'admin' && ['adminDashboard', 'publish', 'queries', 'manageNotices', 'managePopup', 'manageHero'].includes(currentView) ? renderAdminDashboard() :
                currentView === 'home' ? renderHome() :
                    currentView === 'notices' ? renderNotices() :
                        currentView === 'submitQuery' ? renderSubmitQuery() :
                            currentView === 'myQueries' ? renderMyQueries() :
                                currentView === 'contacts' ? renderContacts() :
                                    currentView === 'support' ? renderSupportCenter() :
                                        currentView === 'adminLogin' ? renderAdminLogin() : renderHome();
            document.getElementById('app').innerHTML = renderNavbar() + renderMarquee() + `<main class="flex-grow">${content}</main>` + renderLanguageModal() + renderPopupMessage() + renderLatestNewsPopup();
        }

        window.setLanguage = (newLang) => {
            lang = newLang;
            localStorage.setItem('lang', lang);
            showLanguageModal = false;
            render();
        };

        window.startCamera = async () => {
            const video = document.getElementById('video-feed');
            const status = document.getElementById('cam-status');
            if (!video || !navigator.mediaDevices?.getUserMedia) {
                if (status) status.textContent = t('cameraUnavailable');
                return;
            }
            if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
            status.textContent = t('cameraAccess');
            try {
                cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            } catch {
                try {
                    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
                } catch {
                    cameraStream = null;
                    status.textContent = t('cameraUnavailable');
                    return;
                }
            }
            video.srcObject = cameraStream;
            try { await video.play(); } catch (e) { }
            status.textContent = t('cameraReady');
            render();
        };

        window.capturePhoto = () => {
            const video = document.getElementById('video-feed');
            const canvas = document.getElementById('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            capturedImage = canvas.toDataURL('image/jpeg', 0.85);
            if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
            cameraStream = null;
            const fileInput = document.getElementById('file-upload');
            if (fileInput) fileInput.value = '';
            render();
        };

        window.handleFileUpload = (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
                cameraStream = null;
                capturedImage = reader.result;
                const status = document.getElementById('cam-status');
                if (status) status.textContent = '';
                render();
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        };

        window.handleNoticeFileUpload = (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                noticePhoto = reader.result;
                render();
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        };

        window.submitQuery = () => {
            const name = document.getElementById('qname').value.trim();
            const location = document.getElementById('qlocation').value.trim();
            const subject = document.getElementById('qsubject').value.trim();
            const message = document.getElementById('qmessage').value.trim();
            if (!name || !location || !subject || !message) return toast(t('fillAllFields'), true);
            const queryId = Date.now();
            queries.unshift({
                id: queryId,
                subject,
                message,
                photo: capturedImage,
                userId: 'user_' + queryId,
                userName: name,
                location,
                status: 'new',
                date: new Date()
            });
            userQueries.push(queryId);
            localStorage.setItem('queries', JSON.stringify(queries));
            localStorage.setItem('userQueries', JSON.stringify(userQueries));
            toast(t('querySuccess'));
            capturedImage = null;
            ['qname', 'qlocation', 'qsubject', 'qmessage'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            currentView = 'myQueries';
            render();
        };

        window.updateNoticeDraft = (field, value) => {
            if (!noticeDraft) noticeDraft = { title: '', content: '' };
            noticeDraft = { ...noticeDraft, [field]: value };
        };


        window.openNoticeEditor = () => {
            editingNoticeId = null;
            noticePhoto = null;
            noticeDraft = { title: '', content: '' };
            currentView = 'publish';
            render();
        };

        window.openHeroManager = () => {
            heroDraft = { caption: heroBanner?.caption || '', photo: heroBanner?.src || null };
            currentView = 'manageHero';
            render();
        };

        window.publishNotice = () => {
            const titleInput = document.getElementById('ntitle');
            const contentInput = document.getElementById('ncontent');
            if (!titleInput || !contentInput) {
                toast(lang === 'ne' ? 'सूचना फारम उपलब्ध छैन।' : 'Notice form is not available.', true);
                return;
            }
            const title = titleInput.value.trim();
            const content = contentInput.value.trim();
            if (!title || !content) return toast(t('needTitleContent'), true);

            if (editingNoticeId) {
                const noticeIndex = notices.findIndex(n => n.id === editingNoticeId);
                if (noticeIndex !== -1) {
                    notices[noticeIndex] = { ...notices[noticeIndex], title, content, photo: noticePhoto, date: new Date() };
                    localStorage.setItem('notices', JSON.stringify(notices));
                    toast(t('noticeUpdated'));
                    editingNoticeId = null;
                    noticePhoto = null;
                }
            } else {
                notices.unshift({ id: Date.now(), title, content, photo: noticePhoto, publisher: adminName, date: new Date() });
                localStorage.setItem('notices', JSON.stringify(notices));
                toast(t('noticeSuccess'));
                noticePhoto = null;
                // Reset latest news dismissed state when new notice is published
                latestNewsDismissed = false;
                localStorage.removeItem('latestNewsDismissed');
            }

            titleInput.value = '';
            contentInput.value = '';
            noticeDraft = { title: '', content: '' };
            currentView = 'manageNotices';
            render();
        };

        window.editNotice = (id) => {
            const notice = notices.find(n => (n.id && n.id == id) || (!n.id && n.date && new Date(n.date).getTime() == id));
            if (!notice) {
                const index = parseInt(id);
                if (!isNaN(index) && notices[index]) {
                    const n = notices[index];
                    if (!n.id) n.id = Date.now();
                    editingNoticeId = n.id;
                    noticePhoto = n.photo || null;
                    noticeDraft = { title: n.title || '', content: n.content || '' };
                    currentView = 'publish';
                    render();
                    localStorage.setItem('notices', JSON.stringify(notices));
                    return;
                }
                return;
            }
            if (!notice.id) notice.id = Date.now();
            editingNoticeId = notice.id;
            noticePhoto = notice.photo || null;
            noticeDraft = { title: notice.title || '', content: notice.content || '' };
            currentView = 'publish';
            render();
            localStorage.setItem('notices', JSON.stringify(notices));
        };

        window.confirmDeleteNotice = (id) => {
            if (confirm(t('confirmDelete'))) {
                deleteNotice(id);
            }
        };

        window.deleteNotice = (id) => {
            const index = notices.findIndex(n => (n.id && n.id == id) || (!n.id && n.date && new Date(n.date).getTime() == id));
            if (index === -1) {
                const numId = parseInt(id);
                if (!isNaN(numId) && notices[numId]) {
                    notices.splice(numId, 1);
                }
            } else {
                notices.splice(index, 1);
            }
            localStorage.setItem('notices', JSON.stringify(notices));
            toast(t('noticeDeleted'));
            render();
        };

        window.adminLogin = () => {
            if (document.getElementById('auser').value === 'admin' && document.getElementById('apass').value === '123') {
                role = 'admin'; adminName = 'Gau Shiksha Admin';
                localStorage.setItem('role', 'admin');
                localStorage.setItem('adminName', adminName);
                currentView = 'adminDashboard';
                render();
            } else toast(t('loginFailed'), true);
        };

        window.adminLogout = () => {
            if (confirm(t('confirmLogout'))) {
                role = 'user';
                editingNoticeId = null;
                localStorage.removeItem('role');
                localStorage.removeItem('adminName');
                currentView = 'home';
                toast(t('logoutSuccess'));
                render();
            }
        };

        window.toggleStatus = (id) => {
            queries = queries.map(q => q.id == id ? { ...q, status: q.status === 'new' ? 'seen' : 'new' } : q);
            localStorage.setItem('queries', JSON.stringify(queries));
            render();
        };

        window.submitReply = (id) => {
            const replyTextarea = document.getElementById(`reply-${id}`);
            if (!replyTextarea) return;
            const replyText = replyTextarea.value.trim();
            if (!replyText) {
                toast(t('fillAllFields'), true);
                return;
            }
            queries = queries.map(q => {
                if (q.id == id) {
                    return {
                        ...q,
                        reply: replyText,
                        replyDate: new Date(),
                        status: 'seen'
                    };
                }
                return q;
            });
            localStorage.setItem('queries', JSON.stringify(queries));
            toast(t('replySuccess'));
            render();
        };

        window.handlePopupFileUpload = (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                popupPhoto = reader.result;
                render();
            };
            reader.readAsDataURL(file);
            event.target.value = '';
        };

        window.handleHeroFileUpload = (event) => {
            try {
                const file = event?.target?.files?.[0];
                if (!file) {
                    if (event && event.target) event.target.value = '';
                    return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                    heroDraft = { ...heroDraft, photo: reader.result };
                    render();
                };
                reader.onerror = () => {
                    toast(lang==='ne' ? 'फाइल पढ्न त्रुटि' : 'File read error', true);
                };
                reader.readAsDataURL(file);
                if (event && event.target) event.target.value = '';
            } catch (e) {
                toast(lang==='ne' ? 'त्रुटि भयो' : 'Unexpected error', true);
            }
        };

        window.saveHeroBanner = () => {
            const photo = heroDraft?.photo;
            const caption = (heroDraft?.caption || '').trim();
            if (!photo) {
                toast(lang==='ne' ? 'कृपया फोटो छान्नुहोस्' : 'Please choose a photo', true);
                return;
            }
            heroBanner = { src: photo, caption };
            localStorage.setItem('heroBanner', JSON.stringify(heroBanner));
            heroDraft = { caption, photo };
            toast(lang==='ne' ? 'फोटो अपडेट भयो' : 'Hero photo updated');
            currentView = 'adminDashboard';
            render();
        };

        window.clearHeroDraftPhoto = () => {
            heroDraft = { ...heroDraft, photo: null };
            render();
        };

        window.updateHeroDraft = (field, value) => {
            heroDraft = { ...heroDraft, [field]: value };
        };

        window.setPopupMessage = () => {
            const title = document.getElementById('popup-title')?.value.trim() || '';
            const content = document.getElementById('popup-content')?.value.trim() || '';
            if (!title && !content) {
                toast(t('fillAllFields'), true);
                return;
            }
            popupMessage = {
                title,
                content,
                photo: popupPhoto || (popupMessage && popupMessage.photo) || null
            };
            localStorage.setItem('popupMessage', JSON.stringify(popupMessage));
            popupDismissed = false;
            localStorage.removeItem('popupDismissed');
            toast(t('popupSet'));
            popupPhoto = null;
            currentView = 'adminDashboard';
            render();
        };

        window.setSupportTab = (tab) => {
            supportTab = tab === 'staff' ? 'staff' : 'emergency';
            localStorage.setItem('supportTab', supportTab);
            render();
        };

        window.toggleSupportSection = (id) => {
            if (id === 'staff') {
                supportAccordion.staff = !supportAccordion.staff;
            } else {
                supportAccordion.emergency = !supportAccordion.emergency;
            }
            localStorage.setItem('supportAccordion', JSON.stringify(supportAccordion));
            render();
        };

        window.setStaffFilter = (val) => {
            staffFilter = (val || '').trim();
            localStorage.setItem('staffFilter', staffFilter);
            render();
        };

        window.clearStaffFilter = () => { setStaffFilter(''); };

        window.saveMovingText = () => {
            const neText = document.getElementById('moving-ne')?.value.trim() || '';
            const enText = document.getElementById('moving-en')?.value.trim() || '';
            movingText = { ne: neText || texts.ne.movingText, en: enText || texts.en.movingText };
            localStorage.setItem('movingText', JSON.stringify(movingText));
            toast(lang === 'ne' ? 'मुभिङ टेक्स्ट सेभ भयो' : 'Marquee saved');
            render();
        };

        window.resetMovingText = () => {
            movingText = { ne: texts.ne.movingText, en: texts.en.movingText };
            localStorage.setItem('movingText', JSON.stringify(movingText));
            toast(lang === 'ne' ? 'मुभिङ टेक्स्ट रिसेट भयो' : 'Marquee reset');
            render();
        };

        window.clearPopupMessage = () => {
            popupMessage = null;
            popupPhoto = null;
            localStorage.removeItem('popupMessage');
            localStorage.removeItem('popupDismissed');
            toast(t('popupCleared'));
            currentView = 'adminDashboard';
            render();
        };

        window.dismissPopup = () => {
            try {
                const opt = document.getElementById('popup-optout');
                if (opt && opt.checked) {
                    popupOptOut = true;
                    localStorage.setItem('popupOptOut', 'true');
                }
            } catch (e) { }
            popupDismissed = true;
            // keep dismissal non-persistent so popup shows on refresh unless user opted out
            localStorage.removeItem('popupDismissed');
            render();
        };

        window.dismissLatestNews = () => {
            latestNewsDismissed = true;
            localStorage.setItem('latestNewsDismissed', 'true');
            render();
        };

        // Popup: delayed show + persisted "Don't show again" opt-out
        let popupVisible = false;
        let popupOptOut = localStorage.getItem('popupOptOut') === 'true';
        if (popupMessage && !popupOptOut) {
            // show popup after a short delay for better UX
            setTimeout(() => {
                popupVisible = true;
                popupDismissed = false;
                render();
            }, 700);
        }

        // Start
        render();
    

+
        (function () { if (!window.chatbase || window.chatbase("getState") !== "initialized") { window.chatbase = (...arguments) => { if (!window.chatbase.q) { window.chatbase.q = [] } window.chatbase.q.push(arguments) }; window.chatbase = new Proxy(window.chatbase, { get(target, prop) { if (prop === "q") { return target.q } return (...args) => target(prop, ...args) } }) } const onLoad = function () { const script = document.createElement("script"); script.src = "https://www.chatbase.co/embed.min.js"; script.id = "5J_Tyzou74KFXr80PDJvF"; script.domain = "www.chatbase.co"; document.body.appendChild(script) }; if (document.readyState === "complete") { onLoad() } else { window.addEventListener("load", onLoad) } })();
    