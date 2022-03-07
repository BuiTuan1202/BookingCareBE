
import express from "express";
import homeController from "../controllers/homeController";
import userController from "../controllers/userController";
import doctorController from '../controllers/doctorController'
let router = express.Router();

let initWebRoutes = (app) => {
    router.get('/', homeController.getHomePage);
    router.get('/crud', homeController.getCRUD);
    router.post('/port-crud', homeController.postCRUD);
    router.get('/getCRUD', homeController.displayGetCRUD);
    router.get('/edit-crud', homeController.GetEditCRUD);
    router.post('/put-crud', homeController.PutCRUD);
    router.get('/delete-crud', homeController.DeleteCRUD);

    router.post('/api/login', userController.HandleLogin);
    router.get('/api/get-all-users', userController.handleGetAllUsers);
    router.post('/api/create-new-user', userController.handleCreateNewUser);
    router.put('/api/edit-user', userController.handleEditUser);
    router.delete('/api/delete-user', userController.handleDeleteUser);
    router.get('/api/get-allcode', userController.getAllcode);

    router.get('/api/get-top-doctor-home', doctorController.getTopDoctorHome);

    return app.use("/", router);
}

module.exports = initWebRoutes;