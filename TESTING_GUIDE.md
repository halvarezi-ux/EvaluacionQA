# 🧪 Testing Guide - Phase 0 Implementation

## Test Users Created

The database has been seeded with 5 test users (one per role):

| Role | Username | Email | Password |
|------|----------|-------|----------|
| **Admin** | `admin` | admin@evaluacionqa.com | `admin123` |
| **QA Lead** | `qalead` | qalead@evaluacionqa.com | `qalead123` |
| **QA** | `qauser` | qa@evaluacionqa.com | `qa123456` |
| **Analista** | `analista` | analista@evaluacionqa.com | `analista123` |
| **Asesor** | `asesor` | asesor@evaluacionqa.com | `asesor123` |

---

## 🎯 Phase 0 - Test Plan

### Test 1: Login Authentication ✅
**Objective:** Verify login works and returns token with user data including role

**Steps:**
1. Open http://localhost:4200
2. For each user above:
   - Enter username in "Usuario" field
   - Enter password in "Contraseña" field
   - Click "Iniciar Sesión"

**Expected Results:**
- ✅ Login succeeds without errors
- ✅ Token is stored in localStorage
- ✅ User data includes role name (string, not id)
- ✅ No console errors

---

### Test 2: Role-Based Redirect 🎯
**Objective:** Verify users are redirected to correct route based on their role

**Steps:**
1. Login with each user
2. Observe redirect destination

**Expected Results:**

| Role | Expected Redirect |
|------|------------------|
| Admin | `/admin` |
| QA Lead | `/dashboard` (placeholder) |
| QA | `/qa` |
| Analista | `/analista` |
| Asesor | `/dashboard` (placeholder) |

**Notes:**
- Admin and QA routes have full components
- QA Lead and Asesor currently redirect to /dashboard (to be implemented in Phase 1)
- All redirects should be automatic after successful login

---

### Test 3: Authentication Interceptor 🔐
**Objective:** Verify Bearer token is automatically added to API requests

**Steps:**
1. Login with any user
2. Open browser DevTools → Network tab
3. Navigate to a protected route or trigger an API call
4. Inspect request headers

**Expected Results:**
- ✅ Request header includes: `Authorization: Bearer {token}`
- ✅ Token matches the one in localStorage
- ✅ All API requests to backend include this header automatically

---

### Test 4: Protected Routes (Role Guards) 🛡️
**Objective:** Verify RoleGuard prevents unauthorized access

**Steps:**
1. Login as **QA** (role_id: 3)
2. Try to access `/admin` directly via URL
3. Login as **Analista** (role_id: 4)
4. Try to access `/qa` directly via URL

**Expected Results:**
- ❌ Access denied or redirect to unauthorized page
- ✅ User cannot access routes not matching their role
- ✅ Console shows guard blocking access

---

### Test 5: Logout Functionality 🚪
**Objective:** Verify logout clears session and redirects properly

**Steps:**
1. Login with any user
2. Verify you're on their role-specific route
3. Click "Cerrar Sesión" or navigate to `/logout`
4. Check localStorage
5. Try accessing a protected route

**Expected Results:**
- ✅ Token removed from localStorage
- ✅ User redirected to `/login`
- ✅ Trying to access protected routes redirects to login
- ✅ No console errors during logout

---

### Test 6: Session Persistence 💾
**Objective:** Verify session persists across page reloads

**Steps:**
1. Login with any user
2. Navigate to their role route
3. Refresh the page (F5)
4. Close and reopen the browser tab

**Expected Results:**
- ✅ User remains logged in after refresh
- ✅ Still on correct route
- ✅ Token still present in localStorage
- ✅ No automatic logout

---

## 🐛 Known Issues to Look For

### Backend Issues:
- ❌ `/api/user` endpoint returns 500 error (doesn't affect login flow)
- ⚠️ Need to verify vendor folder integrity (had autoload issues)

### Frontend Issues:
- ⚠️ QA Lead dashboard component not implemented yet
- ⚠️ Asesor dashboard component not implemented yet
- ⚠️ Need unauthorized/403 page for role guard failures

---

## 📝 Test Results Log

### Test Run: [Date/Time]

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Login - Admin | ⏳ Pending | |
| 1 | Login - QA Lead | ⏳ Pending | |
| 1 | Login - QA | ⏳ Pending | |
| 1 | Login - Analista | ⏳ Pending | |
| 1 | Login - Asesor | ⏳ Pending | |
| 2 | Redirect - Admin | ⏳ Pending | |
| 2 | Redirect - QA Lead | ⏳ Pending | |
| 2 | Redirect - QA | ⏳ Pending | |
| 2 | Redirect - Analista | ⏳ Pending | |
| 2 | Redirect - Asesor | ⏳ Pending | |
| 3 | Auth Interceptor | ⏳ Pending | |
| 4 | Role Guard - QA → Admin | ⏳ Pending | |
| 4 | Role Guard - Analista → QA | ⏳ Pending | |
| 5 | Logout | ⏳ Pending | |
| 6 | Session Persistence | ⏳ Pending | |

---

## 🚀 Next Steps After Testing

### Immediate:
1. Document any bugs found during testing
2. Fix critical issues before Phase 1
3. Create placeholder dashboards for QA Lead and Asesor

### Phase 1 Preparation:
1. Fix `/api/user` 500 error
2. Implement User CRUD (admin only)
3. Implement Role CRUD (admin only)
4. Add Form Requests for validation
5. Add API Resources for response formatting
6. Implement role-based middleware on backend
7. Create proper 403 Unauthorized page

---

## 💡 Tips for Testing

1. **Use Browser DevTools:**
   - Console tab: Watch for errors
   - Network tab: Inspect API requests/responses
   - Application tab: Check localStorage for token

2. **Clear Cache Between Tests:**
   ```javascript
   // Run in browser console to clear
   localStorage.clear();
   ```

3. **Test Error Scenarios:**
   - Wrong password
   - Wrong username
   - Empty fields
   - SQL injection attempts (should be blocked by Laravel)

4. **Monitor Backend Logs:**
   ```bash
   # In backend terminal
   php artisan serve --verbose
   ```

---

## ✅ Success Criteria

Phase 0 is considered **complete** when:
- ✅ All 5 users can login successfully
- ✅ Role-based redirect works for all roles
- ✅ Auth interceptor adds Bearer token to requests
- ✅ Logout clears session and redirects properly
- ✅ No critical bugs or security issues

---

*Generated: February 13, 2026*
*Project: EvaluaciónQA - Enterprise QA Evaluation System*
*Tech Stack: Laravel 10 + Angular 17*
