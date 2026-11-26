import { Router} from "express";
import {
  sanitizeReservaEmbarcacionClubInput,
  findAll, findOne, update, remove, add,
  getReservasPorSocio,
  getReservasPorEmbarcacion,
  getDisponibilidadPorEmbarcacion,
  cancel,
  finalizar
} from "./reservaEmbarcacionClub.controller.js";
import { requireRole, requireSelf, setAuthenticatedId } from "../auth/auth.middleware.js";

export const reservaEmbarcacionClubRouter = Router();

reservaEmbarcacionClubRouter.get("/me", requireRole('socio'), setAuthenticatedId("idSocio"), getReservasPorSocio);
reservaEmbarcacionClubRouter.get("/socio/:idSocio", requireRole('socio'), requireSelf("idSocio"), getReservasPorSocio);
reservaEmbarcacionClubRouter.get("/", requireRole("admin"), findAll);
reservaEmbarcacionClubRouter.get("/embarcacion/:idEmbarcacion/disponibilidad", requireRole('admin', 'socio'), getDisponibilidadPorEmbarcacion);
reservaEmbarcacionClubRouter.get("/embarcacion/:idEmbarcacion", requireRole("admin"), getReservasPorEmbarcacion);
reservaEmbarcacionClubRouter.post("/:id/cancelar", requireRole('admin', 'socio'), cancel);
reservaEmbarcacionClubRouter.post("/:id/finalizar", requireRole('admin', 'socio'), finalizar);
reservaEmbarcacionClubRouter.get("/:id", requireRole("admin"), findOne);
reservaEmbarcacionClubRouter.post("/", requireRole('admin', 'socio'), sanitizeReservaEmbarcacionClubInput, add);
reservaEmbarcacionClubRouter.put("/:id", requireRole('admin', 'socio'), sanitizeReservaEmbarcacionClubInput, update);
reservaEmbarcacionClubRouter.delete("/:id", requireRole("admin"), remove);
