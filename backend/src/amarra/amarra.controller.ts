import { Request, Response } from 'express'
import { Amarra } from './amarra.entity.js'
import { orm } from '../shared/orm.js';


const em = orm.em
em.getRepository(Amarra)


async function findAll(req: Request, res: Response) {
  try{
    const amarra = await em.find(Amarra, {})
    res.status(200).json({message:' finded all amarras', data: Amarra}) 
  } catch (error: any){
    res.status(500).json ({message: error.message})
  }
}

async function findOne(req: Request, res: Response) {
 try{
  const id = Number.parseInt(req.params.id)
  const amarra = await em.findOneOrFail(Amarra, { id })
        res.status(200).json({message: 'found amarra', data: amarra})
      }catch(error: any){
        res.status(500).json({message: error.message})
  }
}


async function add(req: Request, res: Response) {
   try{
    const amarra = em.create(Amarra, req.body)
    await em.flush()
    res.status(201).json({ message: 'Amarra created', data: amarra })
  } catch(error: any){
    res.status(500).json ({message: error.message})
  }
}


async function update(req: Request, res: Response) {
  try{
    const id = Number.parseInt(req.params.id)
    const amarraToUpdate =  em.getReference(Amarra,  id )
    em.assign(amarraToUpdate, req.body)
    await em.flush();
    res.status(200).send({ message: 'Amarra updated successfully'})  
    }catch(error: any){
      res.status(500).json({message: error.message})
    }
}

async function remove(req: Request, res: Response) {
  try{
    const id = Number.parseInt(req.params.id)
    const amarraToRemove = em.getReference(Amarra, id)
    await em.removeAndFlush(amarraToRemove)
    res.status(200).json({message: 'Amarra removed'})
    }catch(error: any){
      res.status(500).json({message: error.message})
    }
}

export {findAll, findOne, add, update, remove }