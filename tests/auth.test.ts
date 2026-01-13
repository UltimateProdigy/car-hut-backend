import { Request, Response, NextFunction } from "express";
import { authController } from "../controllers/authController";
import { authService } from "../services/authService";

jest.mock("../services/authService");

const mockRequest = (partial: Partial<Request>) =>
  ({
    body: {},
    ...partial,
  } as Request);

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

const mockNext = jest.fn();

describe("Auth Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should return 400 if username or password is missing", async () => {
      const req = mockRequest({ body: { username: "" } });
      const res = mockResponse();

      await authController.register(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Username and password are required",
      });
    });

    it("should return 400 if password is less than 6 characters", async () => {
      const req = mockRequest({
        body: { username: "testuser", password: "123" },
      });
      const res = mockResponse();

      await authController.register(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    });

    it("should register a user successfully", async () => {
      const req = mockRequest({
        body: { username: "testuser", password: "password" },
      });
      const res = mockResponse();
      (authService.register as jest.Mock).mockResolvedValue({
        user: {},
        token: "testtoken",
      });

      await authController.register(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User registered successfully",
        data: {
          user: {},
          token: "testtoken",
        },
      });
    });

    it("should handle errors properly", async () => {
      const req = mockRequest({
        body: { username: "testuser", password: "password" },
      });
      const res = mockResponse();
      const error = new Error("Registration error");
      (authService.register as jest.Mock).mockRejectedValue(error);

      await authController.register(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("login", () => {
    it("should return 400 if username or password is missing", async () => {
      const req = mockRequest({ body: { username: "" } });
      const res = mockResponse();

      await authController.login(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Username and password are required",
      });
    });

    it("should login a user successfully", async () => {
      const req = mockRequest({
        body: { username: "testuser", password: "password" },
      });
      const res = mockResponse();
      (authService.login as jest.Mock).mockResolvedValue({
        user: {},
        token: "testtoken",
      });

      await authController.login(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Login successful",
        data: {
          user: {},
          token: "testtoken",
        },
      });
    });

    it("should handle invalid credentials", async () => {
      const req = mockRequest({
        body: { username: "testuser", password: "wrongpassword" },
      });
      const res = mockResponse();
      const error = new Error("Invalid credentials");
      (authService.login as jest.Mock).mockRejectedValue(error);

      await authController.login(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid credentials",
      });
    });

    it("should handle errors properly", async () => {
      const req = mockRequest({
        body: { username: "testuser", password: "password" },
      });
      const res = mockResponse();
      const error = new Error("Login error");
      (authService.login as jest.Mock).mockRejectedValue(error);

      await authController.login(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("registerStaff", () => {
    it("should return 400 if username or password is missing", async () => {
      const req = mockRequest({ body: { username: "" } });
      const res = mockResponse();

      await authController.registerStaff(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Username and password are required",
      });
    });

    it("should return 400 if password is less than 6 characters", async () => {
      const req = mockRequest({
        body: { username: "testuser", password: "123" },
      });
      const res = mockResponse();

      await authController.registerStaff(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    });

    it("should register staff successfully", async () => {
      const req = mockRequest({
        body: { username: "teststaff", password: "password" },
      });
      const res = mockResponse();
      (authService.registerStaff as jest.Mock).mockResolvedValue({
        user: {},
        token: "stafftoken",
      });

      await authController.registerStaff(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Staff registered successfully",
        data: {
          user: {},
          token: "stafftoken",
        },
      });
    });

    it("should handle errors properly during staff registration", async () => {
      const req = mockRequest({
        body: { username: "teststaff", password: "password" },
      });
      const res = mockResponse();
      const error = new Error("Registration error");
      (authService.registerStaff as jest.Mock).mockRejectedValue(error);

      await authController.registerStaff(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("loginStaff", () => {
    it("should return 400 if username or password is missing", async () => {
      const req = mockRequest({ body: { username: "" } });
      const res = mockResponse();

      await authController.loginStaff(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Username and password are required",
      });
    });

    it("should login staff successfully", async () => {
      const req = mockRequest({
        body: { username: "teststaff", password: "password" },
      });
      const res = mockResponse();
      (authService.loginStaff as jest.Mock).mockResolvedValue({
        user: {},
        token: "stafftoken",
      });

      await authController.loginStaff(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Login successful",
        data: {
          user: {},
          token: "stafftoken",
        },
      });
    });

    it("should handle errors properly during staff login", async () => {
      const req = mockRequest({
        body: { username: "teststaff", password: "wrongpassword" },
      });
      const res = mockResponse();
      const error = new Error("Invalid credentials");
      (authService.loginStaff as jest.Mock).mockRejectedValue(error);

      await authController.loginStaff(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it("should handle unexpected errors properly", async () => {
      const req = mockRequest({
        body: { username: "teststaff", password: "password" },
      });
      const res = mockResponse();
      const error = new Error("Login error");
      (authService.loginStaff as jest.Mock).mockRejectedValue(error);

      await authController.loginStaff(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
