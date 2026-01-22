# AI Confirmation Architecture - Testing Guide

## Quick Start Testing

### Prerequisites

1. Ensure dev server is running: `npm run dev`
2. Open browser to `http://localhost:3000` (or your dev URL)
3. Open browser console (F12) to see execution logs

### Test Suite

---

## Test 1: Basic Task Creation with Confirmation ✅

**Objective**: Verify AI generates proposal instead of executing directly

**Steps**:
1. Click the floating microphone button (bottom-right) to open AI Chat Console
2. Type: `add buy groceries to my tasks`
3. Press Enter or click Send

**Expected Results**:
- ✅ AI responds with: "I'll add 'buy groceries' to your tasks."
- ✅ Blue confirmation card appears with:
  - Title: "Add task: buy groceries"
  - Description: "I'll add 'buy groceries' to your tasks."
  - Impacts list showing details
  - **Confirm** and **Cancel** buttons
- ❌ Task is NOT yet created (check tasks page - should be empty)

**Execute Approval**:
4. Click **Confirm** button

**Expected Results**:
- ✅ Success message: "Created task successfully"
- ✅ Task appears in `/dashboard/tasks`
- ✅ Console log: "✅ Task created successfully"

**Pass Criteria**: Task is only created AFTER clicking Confirm, not before.

---

## Test 2: Rejection Flow ✅

**Objective**: Verify user can reject proposals and no state change occurs

**Steps**:
1. Open AI Chat Console
2. Type: `remind me to call mom tomorrow`
3. Press Enter

**Expected Results**:
- ✅ Confirmation card appears
- ✅ Shows details about the reminder
- ✅ Confirm and Cancel buttons visible

**Execute Rejection**:
4. Click **Cancel** button

**Expected Results**:
- ✅ Message: "Okay, I cancelled that action. What else can I help you with?"
- ❌ No reminder created (verify in tasks/reminders)
- ✅ Confirmation card disappears

**Pass Criteria**: NO state change occurs when user rejects.

---

## Test 3: Shopping List with Multiple Items ✅

**Objective**: Verify batch operations work with confirmation

**Steps**:
1. Open AI Chat Console
2. Type: `add milk, eggs, and bread to my shopping list`
3. Press Enter

**Expected Results**:
- ✅ Confirmation card shows:
  - Title: "Add 3 item(s) to shopping list"
  - Description: "I'll add milk, eggs, and bread to your shopping list."
  - Impacts: "Creates 3 shopping items"
  - Items list showing all 3 items
- ❌ Items NOT yet in shopping list

**Execute Approval**:
4. Click **Confirm**

**Expected Results**:
- ✅ Success message
- ✅ All 3 items appear in `/dashboard/shopping`
- ✅ Console log shows 3 items created

**Pass Criteria**: All 3 items created together after single approval.

---

## Test 4: Clarification Flow (No Confirmation Needed)

**Objective**: Verify non-actionable intents don't show confirmation

**Steps**:
1. Open AI Chat Console
2. Type: `hello`
3. Press Enter

**Expected Results**:
- ✅ AI responds with conversational message
- ❌ NO confirmation card appears
- ❌ NO state change

**Pass Criteria**: Clarifications bypass confirmation system.

---

## Test 5: Sequential Commands

**Objective**: Verify multiple proposals can be handled in sequence

**Steps**:
1. Open AI Chat Console
2. Type: `add wash car to tasks`
3. **Confirm** the first proposal
4. Type: `add orange juice to shopping`
5. **Confirm** the second proposal

**Expected Results**:
- ✅ First proposal shows, gets approved, task created
- ✅ Second proposal shows, gets approved, shopping item created
- ✅ Both state changes occur only after approval
- ✅ Chat history shows both conversations

**Pass Criteria**: Each proposal is independent and requires separate approval.

---

## Test 6: Appointment with Date/Time

**Objective**: Verify complex payloads work with confirmation

**Steps**:
1. Open AI Chat Console
2. Type: `schedule dentist appointment on Friday at 2pm`
3. Press Enter

**Expected Results**:
- ✅ Confirmation card shows:
  - Title: "Add appointment: dentist appointment"
  - Impacts showing date and time
- ❌ Appointment NOT created yet

**Execute Approval**:
4. Click **Confirm**

**Expected Results**:
- ✅ Appointment created with correct date/time
- ✅ Appears in calendar/appointments

**Pass Criteria**: Complex data preserved through proposal → approval → execution.

---

## Test 7: Voice Input with Confirmation

**Objective**: Verify voice input works with confirmation flow

**Steps**:
1. Open AI Chat Console
2. Click microphone button
3. Say: "add call plumber to my tasks"
4. Wait for transcription

**Expected Results**:
- ✅ Transcript appears: "add call plumber to my tasks"
- ✅ Confirmation card appears
- ❌ Task NOT created yet

**Execute Approval**:
5. Click **Confirm**

**Expected Results**:
- ✅ Task created successfully
- ✅ Voice synthesis announces success (if enabled)

**Pass Criteria**: Voice input follows same confirmation flow as text.

---

## Test 8: Error Handling

**Objective**: Verify invalid inputs are caught at proposal stage

**Steps**:
1. Open AI Chat Console
2. Type: `add to tasks` (missing task title)
3. Press Enter

**Expected Results**:
- ✅ AI asks clarification: "What task would you like to add?"
- ❌ NO confirmation card appears
- ❌ NO attempt to create empty task

**Pass Criteria**: Validation occurs before proposal generation.

---

## Test 9: Expired Proposals (2-Minute Timeout)

**Objective**: Verify proposals expire after 2 minutes

**Steps**:
1. Open AI Chat Console
2. Type: `add test task`
3. Wait for confirmation card
4. **DO NOT CLICK** anything
5. Wait 2+ minutes

**Expected Results**:
- ✅ Proposal disappears after 2 minutes
- ✅ No state change occurs
- ✅ Console log: Proposal expired

**Pass Criteria**: Stale proposals are automatically cleaned up.

---

## Test 10: Console Close with Pending Proposal

**Objective**: Verify proposals are handled on console close

**Steps**:
1. Open AI Chat Console
2. Type: `add something`
3. Wait for confirmation card
4. Close console (X button)

**Expected Results**:
- ✅ Console closes
- ❌ No state change (proposal not auto-approved)
- ✅ Proposal cleared from queue

**Pass Criteria**: Closing console doesn't auto-approve proposals.

---

## Advanced Tests

### Test 11: Direct Code Bypass Attempt (Developer Test)

**Objective**: Verify architectural guarantee - no code path bypasses approval

**Steps**:
1. Open browser console
2. Try to call handler directly:
   ```javascript
   // This should fail or not exist
   window.tasksHandler.execute({ title: 'Bypass test' })
   ```

**Expected Results**:
- ❌ Handler not accessible from window
- ❌ Execute method is private
- ✅ Error: Method does not exist or is private

**Pass Criteria**: No way to bypass approval system from code.

---

### Test 12: Token Verification

**Objective**: Verify approval tokens are required and validated

**Steps**:
1. Open browser console
2. Try to call executor directly:
   ```javascript
   // This should fail
   commandExecutor.execute('cmd_123', { invalidToken: true })
   ```

**Expected Results**:
- ❌ Execution fails
- ✅ Error: "Invalid approval token"
- ❌ No state change occurs

**Pass Criteria**: Executor rejects invalid tokens.

---

## Regression Tests

### Test 13: Legacy Functionality Still Works

**Objective**: Verify backward compatibility with existing features

**Steps**:
1. Manually create task from `/dashboard/tasks` page
2. Manually add shopping item from `/dashboard/shopping` page
3. Use non-AI features (calendar, notes, etc.)

**Expected Results**:
- ✅ All manual operations work normally
- ✅ No confirmation required for manual actions
- ✅ Only AI actions require confirmation

**Pass Criteria**: Non-AI features unaffected.

---

## Performance Tests

### Test 14: Proposal Generation Speed

**Objective**: Verify confirmation doesn't add significant latency

**Steps**:
1. Open browser console
2. Note timestamp
3. Send AI request
4. Note timestamp when confirmation appears

**Expected Results**:
- ✅ Proposal appears in < 1 second
- ✅ Similar speed to old direct execution
- ✅ No noticeable UX degradation

**Pass Criteria**: Confirmation adds minimal latency.

---

## Known Issues / Limitations

1. **Remaining Handlers**: Only `tasks` and `shopping` handlers fully refactored
   - Other handlers (meals, reminders, appointments, family, pets) still use direct execution
   - These will be migrated in Phase 3

2. **Settings Not Fully Integrated**: `confirmationStyle` setting exists but not fully enforced
   - Currently all actions require confirmation
   - Future: Respect user preference ("ask_before_doing" vs "just_do_it")

3. **Batch Approvals Not Yet Implemented**: Each action requires separate approval
   - Future: Allow approving multiple proposals at once

4. **No Undo Yet**: Once approved, actions are final
   - Future: Add undo capability for recent actions

---

## Console Logs to Monitor

Look for these logs in browser console:

**✅ Success Logs**:
- `✅ Command executors initialized`
- `✅ Task created successfully: [id], [title]`
- `✅ Shopping items created successfully: [count] items`

**🔄 Flow Logs**:
- `🔄 Creating task: [payload]`
- `📤 Sending message: [text]`
- `🧠 GPT Reasoning: [input]`

**❌ Error Logs**:
- `❌ Error creating task: [error]`
- `Command execution failed: [error]`
- `Unauthorized: No approval token`

---

## Quick Debugging

If confirmation isn't showing:
1. Check browser console for errors
2. Verify executors initialized: Look for "✅ Command executors initialized"
3. Check network tab: AI classification should return 200
4. Verify `routeIntentToProposal` is being called (not old `routeIntent`)

If state changes without approval:
1. Check which handler is being used
2. Verify handler uses `propose()`/`execute()` pattern
3. Check executor registry for command type
4. Review approval queue state in React DevTools

---

## Success Criteria Summary

The implementation is successful if:

✅ **No state changes occur without user clicking Confirm**
✅ **Rejecting proposals prevents state changes**
✅ **Proposals show clear, human-readable descriptions**
✅ **Execution only happens after valid approval token**
✅ **Console logs show proper execution flow**
✅ **No way to bypass approval from code**
✅ **Legacy features still work normally**
✅ **Performance impact is minimal**

---

## Reporting Issues

If tests fail, report with:
1. Test number and name
2. Steps that failed
3. Expected vs actual result
4. Browser console logs
5. Network tab (if relevant)
6. Browser and version
