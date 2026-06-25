const router = require('express').Router();
const auth = require('../middleware/auth');

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const leadController = require('../controllers/leadController');
const companyController = require('../controllers/companyController');
const quotationController = require('../controllers/quotationController');
const agreementController = require('../controllers/agreementController');
const reservationController = require('../controllers/reservationController');
const dashboardController = require('../controllers/dashboardController');
const mailController = require('../controllers/mailController');

// ─── Auth ───
router.post('/auth/login', authController.login);
router.get('/auth/me', auth.authRequired, authController.me);
router.post('/auth/change-password', auth.authRequired, authController.changePassword);

// ─── Users ───
router.get('/users', auth.authRequired, auth.adminRequired, userController.list);
router.get('/users/assignable', auth.authRequired, userController.listAssignable);
router.get('/users/me', auth.authRequired, userController.myProfile);
router.put('/users/me', auth.authRequired, userController.updateMyProfile);
router.post('/users/me/signature', auth.authRequired, userController.uploadSignature);
router.delete('/users/me/signature', auth.authRequired, userController.deleteSignature);
router.post('/users', auth.authRequired, auth.adminRequired, userController.create);
router.put('/users/:id', auth.authRequired, auth.adminRequired, userController.update);

// ─── Leads ───
router.get('/leads', auth.authRequired, leadController.list);
router.post('/leads/check-duplicate', auth.authRequired, leadController.checkDuplicate);
router.get('/leads/:id', auth.authRequired, leadController.getOne);
router.post('/leads', auth.authRequired, leadController.create);
router.put('/leads/:id', auth.authRequired, leadController.update);
router.put('/leads/:id/state', auth.authRequired, leadController.changeState);
router.put('/leads/:id/assign', auth.authRequired, auth.adminRequired, leadController.assign);
router.delete('/leads/:id', auth.authRequired, auth.adminRequired, leadController.remove);
router.post('/leads/:id/interactions', auth.authRequired, leadController.addInteraction);

// ─── Companies ───
router.get('/companies', auth.authRequired, companyController.listDirectory);
router.get('/companies/names', auth.authRequired, companyController.listNames);
router.post('/companies', auth.authRequired, companyController.create);
router.put('/companies/:id', auth.authRequired, companyController.update);
router.post('/companies/:id/import-as-lead', auth.authRequired, companyController.importAsLead);

// ─── Quotations ───
router.get('/quotations', auth.authRequired, quotationController.list);
router.get('/quotations/search', auth.authRequired, quotationController.search);
router.get('/quotations/:numero', auth.authRequired, quotationController.load);
router.get('/quotations/:numero/preview', auth.authRequired, quotationController.renderHtml);
router.get('/quotations/:numero/pdf', auth.authRequired, quotationController.renderPdf);
router.post('/quotations', auth.authRequired, quotationController.create);
router.post('/quotations/email-preview', auth.authRequired, quotationController.emailPreview);
router.put('/quotations/:numero/state', auth.authRequired, quotationController.updateState);

// ─── Agreements ───
router.get('/agreements', auth.authRequired, agreementController.list);
router.get('/agreements/search', auth.authRequired, agreementController.search);
router.get('/agreements/:numero', auth.authRequired, agreementController.load);
router.get('/agreements/:numero/preview', auth.authRequired, agreementController.renderHtml);
router.get('/agreements/:numero/pdf', auth.authRequired, agreementController.renderPdf);
router.post('/agreements', auth.authRequired, agreementController.create);
router.post('/agreements/email-preview', auth.authRequired, agreementController.emailPreview);
router.put('/agreements/:numero/state', auth.authRequired, agreementController.updateState);

// ─── Reservations ───
router.get('/reservations', auth.authRequired, reservationController.list);
router.get('/reservations/search', auth.authRequired, reservationController.search);
router.get('/reservations/:numero', auth.authRequired, reservationController.load);
router.get('/reservations/:numero/preview', auth.authRequired, reservationController.renderHtml);
router.get('/reservations/:numero/pdf', auth.authRequired, reservationController.renderPdf);
router.post('/reservations', auth.authRequired, reservationController.create);
router.post('/reservations/email-preview', auth.authRequired, reservationController.emailPreview);
router.put('/reservations/:id', auth.authRequired, reservationController.update);
router.put('/reservations/:numero/state', auth.authRequired, reservationController.updateState);

// ─── Dashboard ───
router.get('/dashboard', auth.authRequired, dashboardController.tablero);

// ─── Mail (envío de PDFs por correo) ───
router.get('/mail/verify', auth.authRequired, auth.adminRequired, mailController.verify);
router.post('/mail/quotations/:numero', auth.authRequired, mailController.sendQuotation);
router.post('/mail/agreements/:numero', auth.authRequired, mailController.sendAgreement);
router.post('/mail/reservations/:numero', auth.authRequired, mailController.sendReservation);

module.exports = router;
