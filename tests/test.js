import { Selector, t } from 'testcafe';
import dotenv from 'dotenv'

dotenv.config()

const loginFormSelectors = {
  userName: Selector('form.login-form input[name="username"]'),
  userPassword: Selector('form.login-form input[name="password"]'),
  submitButton: Selector('form.login-form button[type="submit"]'),
}

const emailSelectors = {
  logo: Selector('a[title="Seznam Email"]'),
  settingsAndLogoutButton: Selector('button[aria-label="Nastavení a odhlášení"]'),
  logoutMenuItem: Selector('div[role="menu"] div[role="menuitem"]').child('a').with('Odhlásit se'),
  newEmailButton: Selector('a[data-command="compose:new"]'),
  sentEmailNotification: Selector('.notification')
}

const newMessageSelectors = {
  recipient: Selector('.recipient-list'),
  subjectText: Selector('.subject input[autocomplete-hammerhead-stored-value="hammerhead|autocomplete-attribute-absence-marker"]'),
  messageText: Selector('.area.apply-styles'),
  sendButton: Selector('button[data-command="compose:send"]:not(.mobile)'),
  confirmButton: Selector('button[data-action="ok"]'),
}

const logIn = async (userName, userPassword) => {
  await t.typeText(loginFormSelectors.userName, userName, { paste: true })
    .typeText(loginFormSelectors.userPassword, userPassword, { paste: true })
    .click(loginFormSelectors.submitButton)
    .expect(emailSelectors.logo.exists).ok()
}

const logInWithWrongCredentials = async (userName, userPassword) => {
  await t.typeText(loginFormSelectors.userName, userName, { paste: true })
    .typeText(loginFormSelectors.userPassword, userPassword, { paste: true })
    .click(loginFormSelectors.submitButton)
    .expect(emailSelectors.logo.exists).notOk()

}
const logOut = async () => {
  await t.click(emailSelectors.settingsAndLogoutButton)
    .click(emailSelectors.logoutMenuItem)
    .expect(emailSelectors.logo.exists).notOk()

}

const fillEmail = async (recipient, message) => {
  await t
    .click(emailSelectors.newEmailButton)
    .typeText(newMessageSelectors.recipient, recipient, { paste: true })
    .click(newMessageSelectors.recipient)
    .typeText(newMessageSelectors.messageText, message, {paste: true})
}

const fillEmailWithSubject = async (recipient, subject, message) => {
  await fillEmail(recipient, message)
  await t
    .typeText(newMessageSelectors.subjectText, subject, {paste: true})
}

const sendEmailwithoutSubject = async (recipient, message) => {
  await fillEmail(recipient, message)
  await t
    .click(newMessageSelectors.sendButton)
    .click(newMessageSelectors.confirmButton)
    .expect(emailSelectors.sentEmailNotification.exists).ok()
}

const sendEmailwithSubject = async (recipient, subject, message) => {
  await fillEmailWithSubject(recipient, subject, message)
  await t
    .click(newMessageSelectors.sendButton)
    .expect(emailSelectors.sentEmailNotification.exists).ok()
}

fixture `email client`
  .page `https://seznam.cz/`;

test('login and logout user', async t => {
  await logIn(process.env.userName, process.env.userPassword)
  await logOut()
})
test('login with wrong credentials', async t => {
  await logInWithWrongCredentials('wrongUserName',  process.env.userPassword)
})

test('login, send e-mail without subject and logout user', async t => {
  await logIn(process.env.userName, process.env.userPassword)
  await sendEmailwithoutSubject('jana.kantorova@bootiq.io', 'Lorem ipsum dolor sit amet.')
  await logOut()
})

test('login, send e-mail with subject and logout user', async t => {
  await logIn(process.env.userName, process.env.userPassword)
  await sendEmailwithSubject('jana.kantorova@bootiq.io','Test', 'Lorem ipsum dolor sit amet.')
  await logOut()
})
