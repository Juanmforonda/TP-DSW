import { Router} from "express";
import {
  sanitizeReservaEmbarcacionClubInput,
  findAll, findOne, update, remove, add,
  getReservasPorSocio,
  getReservasPorEmbarcacion,
  cancel,
  finalizar
} from "./reservaEmbarcacionClub.controller.js";
import { requireRole, requireSelf, setAuthenticatedId } from "../auth/auth.middleware.js";

export const reservaEmbarcacionClubRouter = Router();

reservaEmbarcacionClubRouter.get("/me", setAuthenticatedId("idSocio"), getReservasPorSocio);
reservaEmbarcacionClubRouter.get("/socio/:idSocio", requireSelf("idSocio"), getReservasPorSocio);
reservaEmbarcacionClubRouter.get("/", requireRole("admin"), findAll);
reservaEmbarcacionClubRouter.get("/embarcacion/:idEmbarcacion", requireRole("admin"), getReservasPorEmbarcacion);
reservaEmbarcacionClubRouter.post("/:id/cancelar", cancel);
reservaEmbarcacionClubRouter.post("/:id/finalizar", finalizar);
reservaEmbarcacionClubRouter.get("/:id", requireRole("admin"), findOne);
reservaEmbarcacionClubRouter.post("/", sanitizeReservaEmbarcacionClubInput, add);
reservaEmbarcacionClubRouter.put("/:id", sanitizeReservaEmbarcacionClubInput, update);
reservaEmbarcacionClubRouter.delete("/:id", requireRole("admin"), remove);
