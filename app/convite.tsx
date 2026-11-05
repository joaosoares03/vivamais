import { Redirect } from "expo-router";
import { acessoTestadores } from "../services/ambiente";
import { AcessoPorConvite } from "../components/AcessoPorConvite";
export default function Convite(){return acessoTestadores?<AcessoPorConvite/>:<Redirect href="/acesso"/>;}
