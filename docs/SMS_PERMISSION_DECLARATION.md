# Google Play SMS permission declaration

Plan task T2.11. BudgetBrain asks for `RECEIVE_SMS` and `READ_SMS` to record bank transactions automatically. Google Play allows these permissions only for [listed core uses](https://support.google.com/googleplay/android-developer/answer/10208820). This file holds what to submit in the Play Console **Permissions declaration form**, and what to do if Play says no.

## Permitted use to select

**SMS-based money management**: "Apps that track and manage the user's budget, and that use SMS to do so."

## Core functionality description (paste into the form)

> BudgetBrain is a personal budgeting app. Its core feature records the user's spending and income automatically from the transaction alerts their bank sends by SMS, so the budget stays current without typing each purchase.
>
> RECEIVE_SMS is used to notice a new bank alert as it arrives. READ_SMS is used once, when the user asks, to import transaction alerts from a period they choose, and to catch up on alerts that arrived while the app wasn't running.
>
> On the device, messages are filtered by sender: only messages from known bank and payment sender IDs that mention an amount are read further. All other SMS, including personal messages and OTPs, are ignored and never stored. Message text is never uploaded. Only the extracted transaction fields (amount, currency, date, direction, masked account ending, merchant name) are sent to the user's BudgetBrain account.
>
> Automatic tracking is off by default. The user turns it on in Settings → SMS Auto-Tracking after an in-app explanation, and can turn it off at any time.

## Evidence to attach

- **Demo video** (30–90 s, phone screen recording) showing:
  1. Settings → SMS Auto-Tracking with the toggle off.
  2. Turning it on: the in-app explainer, then the system permission dialog.
  3. A bank SMS arriving (from a test sender) and the transaction appearing in the list or the review queue.
  4. The "Scan past messages" option and its period picker.
  5. Turning tracking off.
- **Privacy policy** section that names SMS, says message text stays on the device, and lists the extracted fields that are uploaded.
- **Data safety form:** "Financial info → Purchase history" collected; "Messages → SMS" accessed on device and **not collected** (not transmitted off the device).

## Checklist before submitting

- [ ] Release build made with the default profile (not `*-nosms`); the manifest contains `SmsReceiver` and both permissions.
- [ ] Explainer text in `PermissionExplainerModal` matches the description above.
- [ ] Privacy policy URL is live and contains the SMS section.
- [ ] Demo video is uploaded as unlisted and linked in the form.

## If Play rejects the declaration

1. Build the `noSms` variant: `eas build -p android --profile production-nosms`. It declares no SMS permission. The settings screen shows "Not available", and manual entry works as before.
2. Upload that build to the same track so the release isn't blocked.
3. Appeal with the video and the wording above. Once the declaration is approved, the default profile can ship again.
