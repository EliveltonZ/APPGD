-- Arquivo gerado a partir do CSV de snippets do Supabase
-- Execute no SQL Editor do Supabase ou via psql (-f)

BEGIN;

CREATE OR REPLACE FUNCTION public.check_password(p_id integer, p_senha text)
 RETURNS SETOF "tblUsuario"
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT * FROM "tblUsuario" WHERE id = p_id and senha = p_senha;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_exportar_projetos(data_inicio date, data_fim date)
 RETURNS TABLE(p_ordemdecompra bigint, p_contrato bigint, p_cliente text, p_ambiente text, p_numproj text, p_chegoufabrica text, p_dataentrega text, p_vendedor text)
 LANGUAGE plpgsql
AS $function$
BEGIN 
  return query
    SELECT ordemdecompra, 
    contrato, 
    cliente, 
    ambiente, 
    numproj, 
    TO_CHAR(chegoufabrica, 'DD/MM/YYYY') as chegoufabrica, 
    TO_CHAR(dataentrega, 'DD/MM/YYYY') dataentrega, 
    vendedor 
    FROM "tblProjetos" WHERE chegoufabrica >= data_inicio and chegoufabrica <= data_fim
    order by chegoufabrica DESC;
  END;
$function$;

CREATE OR REPLACE FUNCTION public.get_previsao(p_ordemdecompra bigint)
 RETURNS TABLE(ordemdecompra bigint, cliente text, contrato bigint, codcc integer, ambiente text, numproj text, lote integer, chegoufabrica date, dataentrega date, corteinicio timestamp without time zone, cortefim timestamp without time zone, cortepausa boolean, corteresp smallint, customizacaoinicio timestamp without time zone, customizacaofim timestamp without time zone, customizacaopausa boolean, customizacaoresp smallint, coladeirainicio timestamp without time zone, coladeirafim timestamp without time zone, coladeirapausa boolean, coladeiraresp smallint, usinageminicio timestamp without time zone, usinagemfim timestamp without time zone, usinagempausa boolean, usinagemresp smallint, montageminicio timestamp without time zone, montagemfim timestamp without time zone, montagempausa boolean, montagemresp smallint, paineisinicio timestamp without time zone, paineisfim timestamp without time zone, paineispausa boolean, paineisresp smallint, acabamentoinicio timestamp without time zone, acabamentofim timestamp without time zone, acabamentopausa boolean, acabamentoresp smallint, embalageminicio timestamp without time zone, embalagemfim timestamp without time zone, embalagempausa boolean, embalagemresp smallint, observacoes text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RAISE NOTICE 'Iniciando a execução da função com ordemdecompra: %', p_ordemdecompra;
    RETURN QUERY
    SELECT 
    "tblProjetos".ordemdecompra,
    "tblProjetos".cliente,
    "tblProjetos".contrato,
    "tblProjetos".codcc,
    "tblProjetos".ambiente,
    "tblProjetos".numproj,
    "tblProjetos".lote,
    "tblProjetos".chegoufabrica,
    "tblProjetos".dataentrega,

    "tblProducao".corteinicio, 
    "tblProducao".cortefim, 
    "tblProducao".cortepausa, 
    "tblProducao".corteresp,

    "tblProducao".customizacaoinicio, 
    "tblProducao".customizacaofim, 
    "tblProducao".customizacaopausa,
    "tblProducao".customizacaoresp, 

    "tblProducao".coladeirainicio, 
    "tblProducao".coladeirafim, 
    "tblProducao".coladeirapausa,
    "tblProducao".coladeiraresp, 

    "tblProducao".usinageminicio, 
    "tblProducao".usinagemfim, 
    "tblProducao".usinagempausa,
    "tblProducao".usinagemresp, 

    "tblProducao".montageminicio, 
    "tblProducao".montagemfim, 
    "tblProducao".montagempausa,
    "tblProducao".montagemresp, 

    "tblProducao".paineisinicio, 
    "tblProducao".paineisfim, 
    "tblProducao".paineispausa,
    "tblProducao".paineisresp,

    "tblProducao".acabamentoinicio, 
    "tblProducao".acabamentofim, 
    "tblProducao".acabamentopausa,
    "tblProducao".acabamentoresp,

    "tblProducao".embalageminicio, 
    "tblProducao".embalagemfim, 
    "tblProducao".embalagempausa,
    "tblProducao".embalagemresp,

    "tblProducao".Observacoes

    FROM "tblProjetos" INNER JOIN "tblProducao" ON "tblProjetos".ordemdecompra = "tblProducao".ordemdecompra
    WHERE "tblProjetos".ordemdecompra = p_ordemdecompra;

END;
$function$;

CREATE OR REPLACE FUNCTION public.get_project_exp(data_condition date)
 RETURNS TABLE(total bigint, a text, ordemdecompra bigint, pedido smallint, etapa text, codcc integer, cliente text, contrato bigint, numproj text, ambiente text, tipo text, chegoufabrica date, dataentrega date, lote integer, status text, iniciado date, pronto date, entrega date)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT (SELECT COUNT("tblAcessorios".ordemdecompra) - COUNT("tblAcessorios".recebido) 
        FROM "tblAcessorios" 
        WHERE "tblAcessorios".ordemdecompra = "tblProjetos".ordemdecompra) AS total,
        CASE 
            WHEN EXISTS (SELECT 1 FROM "tblAcessorios" WHERE "tblAcessorios".ordemdecompra = "tblProjetos".ordemdecompra) THEN 'chr(9679)'
            ELSE ''
        END AS a,
        "tblProjetos".ordemdecompra,
        "tblProjetos".pedido,
        "tblProjetos".Etapa,
        "tblProjetos".CodCC,
        "tblProjetos".cliente,
        "tblProjetos".contrato,
        "tblProjetos".numproj,
        "tblProjetos".ambiente,
        "tblProjetos".tipo,
        "tblProjetos".chegoufabrica,
        "tblProjetos".dataentrega,
        "tblProjetos".lote,
        CASE 
            WHEN "tblProjetos".parceado THEN 'PARCEADO'
            WHEN "tblProjetos".pendencia THEN 'PENDENCIA'
            WHEN "tblProjetos".entrega IS NOT NULL THEN 'ENTREGUE'
            WHEN "tblProjetos".dataentrega > CURRENT_DATE AND "tblProjetos".urgente THEN 'URGENTE'
            WHEN "tblProjetos".dataentrega < CURRENT_DATE THEN 'ATRASADO'
            WHEN "tblProjetos".pronto IS NOT NULL THEN 'PRONTO'
            WHEN "tblProjetos".dataentrega < CURRENT_DATE + INTERVAL '10 days' THEN 'A VENCER'
            WHEN "tblProjetos".pronto IS NOT NULL THEN 'PRONTO'
            WHEN "tblProjetos".iniciado IS NOT NULL THEN 'INICIADO'
            ELSE 'AGUARDANDO'
        END AS Status,
        "tblProjetos".iniciado,
        "tblProjetos".pronto,
        "tblProjetos".entrega
    FROM
        "tblProjetos"
    WHERE
        (CASE 
            WHEN "tblProjetos".parceado THEN 'PARCEADO'
            WHEN "tblProjetos".pendencia THEN 'PENDENCIA'
            WHEN "tblProjetos".entrega IS NOT NULL THEN 'ENTREGUE'
            WHEN "tblProjetos".dataentrega > CURRENT_DATE AND "tblProjetos".urgente THEN 'URGENTE'
            WHEN "tblProjetos".dataentrega < CURRENT_DATE THEN 'ATRASADO'
            WHEN "tblProjetos".pronto IS NOT NULL THEN 'PRONTO'
            WHEN "tblProjetos".dataentrega < CURRENT_DATE + INTERVAL '10 days' THEN 'A VENCER'
            WHEN "tblProjetos".pronto IS NOT NULL THEN 'PRONTO'
            WHEN "tblProjetos".iniciado IS NOT NULL THEN 'INICIADO'
            ELSE 'AGUARDANDO'
        END) IN ('INICIADO', 'ATRASADO', 'A VENCER', 'PARCEADO', 'URGENTE', 'PENDENCIA', 'PRONTO', 'AGUARDANDO', 'ENTREGUE') 
        AND "tblProjetos".dataentrega > data_condition
    ORDER BY "tblProjetos".dataentrega, "tblProjetos".cliente;
END;
$function$;

CREATE OR REPLACE FUNCTION public.atualizar_etapa_por_pedido(codigo integer, pedido integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
  etapa_map JSONB := '{
    "2": "corte",
    "3": "customizacao",
    "4": "coladeira",
    "5": "usinagem",
    "6": "montagem",
    "7": "paineis",
    "8": "embalagem"
  }';

  campo TEXT;
  ordem TEXT;
BEGIN
  -- Monta o nome do campo baseado no código
  campo := (etapa_map ->> SUBSTRING(codigo::TEXT, 1, 1)) || 
           CASE SUBSTRING(codigo::TEXT, 2, 1)
             WHEN '1' THEN 'inicio'
             WHEN '2' THEN 'fim'
           END;

  -- Busca a ordem de compra na tblProjetos
  SELECT ordemdecompra INTO ordem
  FROM tblProjetos
  WHERE pedido = pedido;

  -- Atualiza o campo correspondente na tblProducao
  EXECUTE format('UPDATE tblProducao SET %I = now() WHERE ordemdecompra = $1', campo)
  USING ordem;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_last_lote()
 RETURNS TABLE(p_lote integer)
 LANGUAGE plpgsql
AS $function$
begin
return query
  SELECT max(lote)
  FROM "tblProjetos";
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_status(p_ordemdecompra bigint)
 RETURNS TABLE(ordemdecompra bigint, cliente text, contrato bigint, codcc integer, ambiente text, numproj text, lote integer, chegoufabrica date, dataentrega date, scorte text, scustom text, scoladeira text, susinagem text, smontagem text, spaineis text, sacabamento text, sembalagem text, previsao date, pronto date, entrega date, tamanho text, totalvolumes smallint, observacoes text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        "tblProjetos".ordemdecompra,
        "tblProjetos".cliente,
        "tblProjetos".contrato,
        "tblProjetos".CodCC,
        "tblProjetos".ambiente,
        "tblProjetos".numproj,
        "tblProjetos".lote,
        "tblProjetos".chegoufabrica,
        "tblProjetos".dataentrega,
        CASE 
            WHEN "cortefim" IS NOT NULL THEN 'FINALIZADO' 
            WHEN "corteinicio" IS NOT NULL THEN 'INICIADO' 
            ELSE 'AGUARDE' 
        END AS Corte,
        CASE 
            WHEN "customizacaofim" IS NOT NULL THEN 'FINALIZADO' 
            WHEN "customizacaoinicio" IS NOT NULL THEN 'INICIADO' 
            ELSE 'AGUARDE' 
        END AS Custom,
        CASE 
            WHEN "coladeirafim" IS NOT NULL THEN 'FINALIZADO' 
            WHEN "coladeirainicio" IS NOT NULL THEN 'INICIADO' 
            ELSE 'AGUARDE' 
        END AS Coladeira,
        CASE 
            WHEN "usinagemfim" IS NOT NULL THEN 'FINALIZADO' 
            WHEN "usinageminicio" IS NOT NULL THEN 'INICIADO' 
            ELSE 'AGUARDE' 
        END AS Usinagem,
        CASE 
            WHEN "montagemfim" IS NOT NULL THEN 'FINALIZADO' 
            WHEN "montageminicio" IS NOT NULL THEN 'INICIADO' 
            ELSE 'AGUARDE' 
        END AS Montagem,
        CASE 
            WHEN "paineisfim" IS NOT NULL THEN 'FINALIZADO' 
            WHEN "paineisinicio" IS NOT NULL THEN 'INICIADO' 
            ELSE 'AGUARDE' 
        END AS Paineis,
        CASE 
            WHEN "acabamentofim" IS NOT NULL THEN 'FINALIZADO' 
            WHEN "acabamentoinicio" IS NOT NULL THEN 'INICIADO' 
            ELSE 'AGUARDE' 
        END AS Acabamento,
        CASE 
            WHEN "embalagemfim" IS NOT NULL THEN 'FINALIZADO' 
            WHEN "embalageminicio" IS NOT NULL THEN 'INICIADO' 
            ELSE 'AGUARDE' 
        END AS Embalagem,
        "tblProjetos".previsao,
        "tblProjetos".pronto,
        "tblProjetos".entrega,
        "tblProducao".tamanho,
        "tblAvulsos".totalvolumes,
        "tblProducao".observacoes
    FROM 
        "tblProjetos"
    INNER JOIN 
        "tblProducao" ON "tblProjetos".ordemdecompra = "tblProducao".ordemdecompra
    INNER JOIN 
        "tblAvulsos" ON "tblProjetos".ordemdecompra = "tblAvulsos".ordemdecompra
    WHERE 
        "tblProjetos".ordemdecompra = p_ordemdecompra;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_acessorios(p_ordemdecompra bigint)
 RETURNS TABLE(id bigint, categoria text, descricao text, medida text, qtd smallint, datacompra date, previsao date, recebido date)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT "tblAcessorios".id, 
  "tblAcessorios".categoria,
  "tblAcessorios".descricao, 
  "tblAcessorios".medida, 
  "tblAcessorios".qtd, 
  "tblAcessorios".datacompra, 
  "tblAcessorios".previsao, 
  "tblAcessorios".recebido from "tblAcessorios" WHERE ordemdecompra = p_ordemdecompra;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_tipo(p_ordemdecompra bigint, p_tipo text, p_urgente boolean)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  UPDATE "tblProjetos" SET tipo = p_tipo, urgente = p_urgente
  where ordemdecompra = p_ordemdecompra;
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_etapa(p_pedido integer, p_codigo integer)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  etapa_map JSONB := '{
    "2": "corte",
    "3": "customizacao",
    "4": "coladeira",
    "5": "usinagem",
    "6": "montagem",
    "7": "paineis",
    "8": "embalagem"
  }';

  etapa TEXT;
  acao TEXT;
  campo TEXT;
  ordem bigint;
  timestamp_aplicado TIMESTAMP;
BEGIN

  etapa := etapa_map ->> SUBSTRING(p_codigo::TEXT, 1, 1);
  acao := CASE SUBSTRING(p_codigo::TEXT, 2, 1)
            WHEN '1' THEN 'inicio'
            WHEN '2' THEN 'fim'
            ELSE NULL
          END;

  IF etapa IS NULL THEN
    RETURN format('Código inválido: etapa não encontrada (%s)', p_codigo);
  END IF;

  IF acao IS NULL THEN
    RETURN format('Código inválido: ação não reconhecida (%s)', p_codigo);
  END IF;

  campo := etapa || acao;

  SELECT ordemdecompra INTO ordem
  FROM "tblProjetos"
  WHERE pedido = p_pedido;

  IF ordem IS NULL THEN
    RETURN format('Nenhuma ordem de compra encontrada para o pedido %s', p_pedido);
  END IF;

  timestamp_aplicado := date_trunc('second', current_timestamp AT TIME ZONE 'America/Sao_Paulo');

  EXECUTE format(
    'UPDATE "tblProducao" SET %I = $1 WHERE ordemdecompra = $2',
    campo
  )
  USING timestamp_aplicado, ordem;

  RETURN format(
    'Campo "%s" atualizado com %s para ordemdecompra "%s".',
    campo, to_char(timestamp_aplicado, 'YYYY-MM-DD HH24:MI:SS'), ordem
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_project_prod()
 RETURNS TABLE(total bigint, a text, ordemdecompra bigint, pedido smallint, etapa text, codcc integer, cliente text, contrato bigint, numproj text, ambiente text, tipo text, chegoufabrica date, dataentrega date, lote integer, status text, iniciado date, previsao date, pronto date, entrega date, observacoes text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    SET TIMEZONE TO 'America/Sao_Paulo';
    RETURN QUERY
    SELECT (SELECT COUNT("tblAcessorios".ordemdecompra) - COUNT("tblAcessorios".recebido) 
     FROM "tblAcessorios" 
     WHERE "tblAcessorios".ordemdecompra = "tblProjetos".ordemdecompra) AS total,
    CASE 
        WHEN EXISTS (SELECT 1 FROM "tblAcessorios" WHERE "tblAcessorios".ordemdecompra = "tblProjetos".ordemdecompra) THEN 'chr(9679)'
        ELSE ''
    END AS a,
    "tblProjetos".ordemdecompra,
    "tblProjetos".pedido,
    "tblProjetos".Etapa,
    "tblProjetos".CodCC,
    "tblProjetos".cliente,
    "tblProjetos".contrato,
    "tblProjetos".numproj,
    "tblProjetos".ambiente,
    "tblProjetos".tipo,
    "tblProjetos".chegoufabrica,
    "tblProjetos".dataentrega,
    "tblProjetos".lote,
       CASE 
        WHEN "tblProjetos".parceado THEN 'PARCEADO'
        WHEN "tblProjetos".pendencia THEN 'PENDENCIA'
        WHEN "tblProjetos".entrega IS NOT NULL THEN 'ENTREGUE'
        WHEN "tblProjetos".dataentrega > CURRENT_DATE  AND "tblProjetos".urgente THEN 'URGENTE'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE THEN 'ATRASADO'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE + INTERVAL '10 days' AND "tblProjetos".pronto IS NOT NULL THEN 'PRONTO'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE + INTERVAL '10 days' THEN 'A VENCER'
        WHEN "tblProjetos".pronto IS NOT NULL THEN 'PRONTO'
        WHEN "tblProjetos".iniciado IS NOT NULL THEN 'INICIADO'
        ELSE 'AGUARDANDO'
    END AS Status,
    "tblProjetos".iniciado,
    "tblProjetos".previsao,
    "tblProjetos".pronto,
    "tblProjetos".entrega,
    "tblProducao".observacoes
FROM 
    "tblProjetos" inner join "tblProducao" on "tblProjetos".ordemdecompra = "tblProducao".ordemdecompra
WHERE 
    (CASE 
        WHEN "tblProjetos".parceado THEN 'PARCEADO'
        WHEN "tblProjetos".pendencia THEN 'PENDENCIA'
        WHEN "tblProjetos".entrega IS NOT NULL THEN 'ENTREGUE'
        WHEN "tblProjetos".iniciado IS NOT NULL AND "tblProjetos".urgente AND "tblProjetos".pronto IS NOT NULL THEN 'PRONTO'
        WHEN "tblProjetos".iniciado IS NOT NULL AND "tblProjetos".urgente THEN 'URGENTE'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE AND "tblProjetos".pronto IS NOT NULL THEN 'PRONTO'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE THEN 'ATRASADO'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE + INTERVAL '10 days' AND "tblProjetos".pronto IS NOT NULL THEN 'PRONTO'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE + INTERVAL '10 days' THEN 'A VENCER'
        WHEN "tblProjetos".pronto IS NOT NULL THEN 'PRONTO'
        WHEN "tblProjetos".iniciado IS NOT NULL THEN 'INICIADO'
        ELSE 'AGUARDANDO'
    END) IN ('INICIADO', 'ATRASADO', 'A VENCER', 'PARCEADO', 'URGENTE', 'PENDENCIA', 'PRONTO', 'AGUARDANDO')
ORDER BY "tblProjetos".dataentrega, "tblProjetos".cliente, "tblProjetos".numproj;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_data_producao(p_ordemdecompra bigint, p_corteinicio timestamp without time zone, p_cortefim timestamp without time zone, p_corteresp smallint, p_cortepausa boolean, p_customizacaoinicio timestamp without time zone, p_customizacaofim timestamp without time zone, p_customizacaoresp smallint, p_customizacaopausa boolean, p_coladeirainicio timestamp without time zone, p_coladeirafim timestamp without time zone, p_coladeiraresp smallint, p_coladeirapausa boolean, p_usinageminicio timestamp without time zone, p_usinagemfim timestamp without time zone, p_usinagemresp smallint, p_usinagempausa boolean, p_montageminicio timestamp without time zone, p_montagemfim timestamp without time zone, p_montagemresp smallint, p_montagempausa boolean, p_paineisinicio timestamp without time zone, p_paineisfim timestamp without time zone, p_paineisresp smallint, p_paineispausa boolean, p_acabamentoinicio timestamp without time zone, p_acabamentofim timestamp without time zone, p_acabamentoresp smallint, p_acabamentopausa boolean, p_observacoes text, p_previsao date)
 RETURNS TABLE(rows_affected integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE 
    v_rows_affected int;
BEGIN
    UPDATE "tblProducao" SET 
        corteinicio = p_corteinicio,
        cortefim = p_cortefim,
        corteresp = p_corteresp,
        cortepausa = p_cortepausa,

        customizacaoinicio = p_customizacaoinicio,
        customizacaofim = p_customizacaofim,
        customizacaoresp = p_customizacaoresp,
        customizacaopausa = p_customizacaopausa,

        coladeirainicio = p_coladeirainicio,
        coladeirafim = p_coladeirafim,
        coladeiraresp = p_coladeiraresp,
        coladeirapausa = p_coladeirapausa,

        usinageminicio = p_usinageminicio,
        usinagemfim = p_usinagemfim,
        usinagemresp = p_usinagemresp,
        usinagempausa = p_usinagempausa,
        
        montageminicio = p_montageminicio,
        montagemfim = p_montagemfim,
        montagemresp = p_montagemresp,
        montagempausa = p_montagempausa,

        paineisinicio = p_paineisinicio,
        paineisfim = p_paineisfim,
        paineisresp = p_paineisresp,
        paineispausa = p_paineispausa,

        acabamentoinicio = p_acabamentoinicio,
        acabamentofim = p_acabamentofim,
        acabamentoresp = p_acabamentoresp,
        acabamentopausa = p_acabamentopausa,

        observacoes = p_observacoes
    WHERE ordemdecompra = p_ordemdecompra;

    UPDATE "tblProjetos" SET previsao = p_previsao
    WHERE ordemdecompra = p_ordemdecompra;

    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    
    RETURN QUERY 
    SELECT v_rows_affected;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_project_previsao()
 RETURNS TABLE(total bigint, a text, ordemdecompra bigint, etapa text, codcc integer, scorte text, scustom text, scoladeira text, susinagem text, smontagem text, spaineis text, sseparacao text, sacabamento text, sembalagem text, cliente text, contrato bigint, ambiente text, dataentrega date, dias_restantes integer, observacoes text, previsao date, status text, urgente boolean, pedido smallint, lote integer, material text, cpendencia date)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
    (SELECT COUNT("tblAcessorios".ordemdecompra) - COUNT("tblAcessorios".recebido) 
     FROM "tblAcessorios" 
     WHERE "tblAcessorios".ordemdecompra = "tblProjetos".ordemdecompra) AS Total,
    CASE 
        WHEN EXISTS (SELECT 1 FROM "tblAcessorios" WHERE "tblAcessorios".ordemdecompra = "tblProjetos".ordemdecompra) THEN 'chr(9679)'
        ELSE ''
    END AS A,
    "tblProjetos".ordemdecompra,
    "tblProjetos".Etapa,
    "tblProjetos".CodCC,
    CASE 
        WHEN "cortefim" IS NOT NULL THEN 'FINALIZADO' 
        WHEN "corteinicio" IS NOT NULL THEN 'INICIADO' 
        ELSE 'AGUARDE' 
    END AS SCorte,
    CASE 
        WHEN "customizacaofim" IS NOT NULL THEN 'FINALIZADO' 
        WHEN "customizacaoinicio" IS NOT NULL THEN 'INICIADO' 
        ELSE 'AGUARDE' 
    END AS SCustom,
    CASE 
        WHEN "coladeirafim" IS NOT NULL THEN 'FINALIZADO' 
        WHEN "coladeirainicio" IS NOT NULL THEN 'INICIADO' 
        ELSE 'AGUARDE' 
    END AS SColadeira,
    CASE 
        WHEN "usinagemfim" IS NOT NULL THEN 'FINALIZADO' 
        WHEN "usinageminicio" IS NOT NULL THEN 'INICIADO' 
        ELSE 'AGUARDE' 
    END AS SUsinagem,
    CASE 
        WHEN "montagemfim" IS NOT NULL THEN 'FINALIZADO' 
        WHEN "montageminicio" IS NOT NULL THEN 'INICIADO' 
        ELSE 'AGUARDE' 
    END AS SMontagem,
    CASE 
        WHEN "paineisfim" IS NOT NULL THEN 'FINALIZADO' 
        WHEN "paineisinicio" IS NOT NULL THEN 'INICIADO' 
        ELSE 'AGUARDE' 
    END AS SPaineis,
    CASE 
        WHEN "separacao" IS NOT NULL THEN 'FINALIZADO' 
        WHEN "embalagemfim" IS NOT NULL THEN 'INICIADO' 
        ELSE 'AGUARDE' 
    END AS SSeparacao,
    CASE 
        WHEN "acabamentofim" IS NOT NULL THEN 'FINALIZADO' 
        WHEN "acabamentoinicio" IS NOT NULL THEN 'INICIADO' 
        ELSE 'AGUARDE' 
    END AS Sacabamento,
    CASE 
        WHEN "embalagemfim" IS NOT NULL THEN 'FINALIZADO' 
        WHEN "embalageminicio" IS NOT NULL THEN 'INICIADO' 
        ELSE 'AGUARDE' 
    END AS SEmbalagem,
    "tblProjetos".cliente,
    "tblProjetos".contrato,
    "tblProjetos".ambiente,
    "tblProjetos".dataentrega,
    ("tblProjetos".dataentrega - CURRENT_DATE) AS "Dias_Restantes",
    "tblProducao".observacoes,
    "tblProjetos".previsao,
    CASE 
        WHEN "tblProjetos".parceado THEN 'PARCEADO'
        WHEN "tblProjetos".pendencia THEN 'PENDENCIA'
        WHEN "tblProjetos".entrega IS NOT NULL THEN 'ENTREGUE'
        WHEN "tblProjetos".pronto IS NOT NULL THEN 'PRONTO'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE THEN 'ATRASADO' 
        WHEN "tblProjetos".iniciado IS NOT NULL AND "tblProjetos".urgente THEN 'URGENTE'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE + INTERVAL '10 days' THEN 'A VENCER'
        WHEN "tblProjetos".iniciado IS NOT NULL THEN 'INICIADO'
        ELSE 'AGUARDANDO'
    END AS Status,
    "tblProjetos".urgente,
    "tblProjetos".pedido,
    "tblProjetos".lote,
    
    CASE 
        WHEN "mbaixado" IS NOT NULL THEN 'RECEBIDO' 
        WHEN "mpedido" IS NOT NULL THEN 'PEDIDO' 
        ELSE '-' 
    END AS Material,
    "tblProjetos".cpendencia
FROM 
    "tblProjetos"
INNER JOIN 
    "tblProducao" ON "tblProjetos".ordemdecompra = "tblProducao".ordemdecompra
WHERE 
    "tblProjetos".codcc IS NOT NULL AND 
    (CASE 
        WHEN "tblProjetos".parceado THEN 'PARCEADO'
        WHEN "tblProjetos".pendencia THEN 'PENDENCIA'
        WHEN "tblProjetos".entrega IS NOT NULL THEN 'ENTREGUE'
        WHEN "tblProjetos".pronto IS NOT NULL THEN 'PRONTO'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE THEN 'ATRASADO'
        WHEN "tblProjetos".iniciado IS NOT NULL AND "tblProjetos".urgente THEN 'URGENTE'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE + INTERVAL '10 days' THEN 'A VENCER'
        WHEN "tblProjetos".iniciado IS NOT NULL THEN 'INICIADO'
        ELSE 'AGUARDANDO'
    END) IN ('INICIADO', 'ATRASADO', 'PARCEADO', 'A VENCER', 'URGENTE', 'PENDENCIA')
    ORDER BY "tblProjetos".previsao, "tblProjetos"."dataentrega", "tblProjetos".cliente;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_projeto_codigo_barras(p_pedido integer)
 RETURNS TABLE(p_contrato bigint, p_cliente text, p_ambiente text)
 LANGUAGE plpgsql
AS $function$
begin
  return query
  SELECT contrato, cliente, ambiente from "tblProjetos" where pedido = p_pedido;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_projetos_lote()
 RETURNS TABLE(p_ordemdecompra bigint, p_pedido smallint, p_codcc integer, p_cliente text, p_ambiente text, p_dataentrega date)
 LANGUAGE plpgsql
AS $function$
begin
  return query
  SELECT 
    ordemdecompra,
    pedido,
    codcc,
    cliente,
    ambiente,
    dataentrega
  FROM 
    "tblProjetos"
  WHERE 
    codcc notnull and lote = 0
  order by codcc;
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_projetos_pcp(p_ordemdecompra bigint, p_urgente boolean, p_codcc integer, p_lote integer, p_pedido smallint, p_tipo text, p_pecas smallint, p_area real)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  UPDATE "tblProjetos" set
  urgente = p_urgente,
  codcc = p_codcc,
  lote = p_lote,
  pedido = p_pedido,
  tipo = p_tipo,
  peças = p_pecas,
  area = p_area
  WHERE ordemdecompra = p_ordemdecompra;
end;
$function$;

CREATE OR REPLACE FUNCTION public.insert_acessorios(p_ordemdecompra bigint, p_categoria text, p_descricao text, p_medida text, p_quantidade smallint, p_fornecedor text, p_compra date, p_previsao date, p_recebido date)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  Insert Into "tblAcessorios" (
    ordemdecompra, categoria, descricao, medida, qtd, fornecedor, datacompra, previsao, recebido
  ) values (
    p_ordemdecompra, p_categoria, p_descricao, p_medida, p_quantidade, p_fornecedor, p_compra, p_previsao, p_recebido
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_contrato_pendencia(p_contrato bigint)
 RETURNS TABLE(p_ordemdecompra bigint, p_cliente text, p_ambiente text, p_dataentrega date)
 LANGUAGE plpgsql
AS $function$
begin
  return query
  SELECT 
    ordemdecompra,
    cliente,
    ambiente,
    dataentrega
  FROM 
    "tblProjetos"
  WHERE
    contrato = p_contrato;
  end;
  $function$;

CREATE OR REPLACE FUNCTION public.get_project_stts(data_condition date)
 RETURNS TABLE(total bigint, a text, ordemdecompra bigint, pedido smallint, etapa text, codcc integer, cliente text, contrato bigint, numproj text, ambiente text, tipo text, chegoufabrica date, dataentrega date, status text, prazo integer, iniciado date, previsao date, pronto date, entrega date)
 LANGUAGE plpgsql
AS $function$
BEGIN
    SET TIMEZONE TO 'America/Sao_Paulo';
    RETURN QUERY
    SELECT 
        (SELECT COUNT("tblAcessorios".ordemdecompra) - COUNT("tblAcessorios".recebido) 
         FROM "tblAcessorios" 
         WHERE "tblAcessorios".ordemdecompra = "tblProjetos".ordemdecompra) AS total,
        CASE 
            WHEN EXISTS (SELECT 1 FROM "tblAcessorios" WHERE "tblAcessorios".ordemdecompra = "tblProjetos".ordemdecompra) THEN 'chr(9679)'
            ELSE ''
        END AS a,
        "tblProjetos".ordemdecompra,
        "tblProjetos".pedido,
        "tblProjetos".Etapa,
        "tblProjetos".CodCC,
        "tblProjetos".cliente,
        "tblProjetos".contrato,
        "tblProjetos".numproj,
        "tblProjetos".ambiente,
        "tblProjetos".tipo,
        "tblProjetos".chegoufabrica,
        "tblProjetos".dataentrega,
        CASE 
            WHEN "tblProjetos".parceado THEN 'PARCEADO'
            WHEN "tblProjetos".pendencia THEN 'PENDENCIA'
            WHEN "tblProjetos".entrega IS NOT NULL THEN 'ENTREGUE'
            WHEN "tblProjetos".dataentrega > CURRENT_DATE AND "tblProjetos".urgente THEN 'URGENTE'
            WHEN "tblProjetos".dataentrega < CURRENT_DATE THEN 'ATRASADO'
            WHEN "tblProjetos".pronto IS NOT NULL THEN 'PRONTO'
            WHEN "tblProjetos".dataentrega < CURRENT_DATE + INTERVAL '10 days' THEN 'A VENCER'
            WHEN "tblProjetos".pronto IS NOT NULL THEN 'PRONTO'
            WHEN "tblProjetos".iniciado IS NOT NULL THEN 'INICIADO'
            ELSE 'AGUARDANDO'
        END AS status,
        CASE
            WHEN "tblProjetos".entrega IS NOT NULL THEN 0
            ELSE "tblProjetos".dataentrega - CURRENT_DATE
        END AS prazo,
        "tblProjetos".iniciado,
        "tblProjetos".previsao,
        "tblProjetos".pronto,
        "tblProjetos".entrega
    FROM 
        "tblProjetos"
    WHERE 
        (CASE 
            WHEN "tblProjetos".parceado THEN 'PARCEADO'
            WHEN "tblProjetos".pendencia THEN 'PENDENCIA'
            WHEN "tblProjetos".entrega IS NOT NULL THEN 'ENTREGUE'
            WHEN "tblProjetos".dataentrega > CURRENT_DATE AND "tblProjetos".urgente THEN 'URGENTE'
            WHEN "tblProjetos".dataentrega < CURRENT_DATE THEN 'ATRASADO'
            WHEN "tblProjetos".pronto IS NOT NULL THEN 'PRONTO'
            WHEN "tblProjetos".dataentrega < CURRENT_DATE + INTERVAL '10 days' THEN 'A VENCER'
            WHEN "tblProjetos".pronto IS NOT NULL THEN 'PRONTO'
            WHEN "tblProjetos".iniciado IS NOT NULL THEN 'INICIADO'
            ELSE 'AGUARDANDO'
        END) IN ('ENTREGUE', 'INICIADO', 'ATRASADO', 'PARCEADO', 'A VENCER', 'URGENTE', 'PENDENCIA', 'PRONTO', 'AGUARDANDO')
        AND "tblProjetos".dataentrega > data_condition
    ORDER BY "tblProjetos".dataentrega, "tblProjetos".cliente;
END;
$function$;

CREATE OR REPLACE FUNCTION public.del_acessorio(p_id integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  delete FROM "tblAcessorios" where id = p_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.setlote(p_ordemdecompra bigint, p_lote integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN 
  UPDATE "tblProjetos" SET
  lote = p_lote
  WHERE ordemdecompra = p_ordemdecompra;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_data(p_id integer)
 RETURNS TABLE(p_data date, p_email text)
 LANGUAGE plpgsql
AS $function$
begin
  return query
  SELECT data, email from "tblDatas" where id = p_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_group_by_acessorios()
 RETURNS TABLE(p_categoria text, count bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        categoria,
        COUNT(*) AS count
    FROM 
        "tblAcessorios"
    GROUP BY 
        categoria
    ORDER BY 
        categoria;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_data_producao(p_ordemdecompra bigint, p_corteinicio timestamp without time zone, p_cortefim timestamp without time zone, p_corteresp smallint, p_cortepausa boolean, p_customizacaoinicio timestamp without time zone, p_customizacaofim timestamp without time zone, p_customizacaoresp smallint, p_customizacaopausa boolean, p_coladeirainicio timestamp without time zone, p_coladeirafim timestamp without time zone, p_coladeiraresp smallint, p_coladeirapausa boolean, p_usinageminicio timestamp without time zone, p_usinagemfim timestamp without time zone, p_usinagemresp smallint, p_usinagempausa boolean, p_montageminicio timestamp without time zone, p_montagemfim timestamp without time zone, p_montagemresp smallint, p_montagempausa boolean, p_paineisinicio timestamp without time zone, p_paineisfim timestamp without time zone, p_paineisresp smallint, p_paineispausa boolean, p_acabamentoinicio timestamp without time zone, p_acabamentofim timestamp without time zone, p_acabamentoresp smallint, p_acabamentopausa boolean, p_embalageminicio timestamp without time zone, p_embalagemfim timestamp without time zone, p_embalagemresp smallint, p_embalagempausa boolean, p_observacoes text, p_previsao date)
 RETURNS TABLE(rows_affected integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE 
    v_rows_affected int;
BEGIN
    UPDATE "tblProducao" SET 
        corteinicio = p_corteinicio,
        cortefim = p_cortefim,
        corteresp = p_corteresp,
        cortepausa = p_cortepausa,

        customizacaoinicio = p_customizacaoinicio,
        customizacaofim = p_customizacaofim,
        customizacaoresp = p_customizacaoresp,
        customizacaopausa = p_customizacaopausa,

        coladeirainicio = p_coladeirainicio,
        coladeirafim = p_coladeirafim,
        coladeiraresp = p_coladeiraresp,
        coladeirapausa = p_coladeirapausa,

        usinageminicio = p_usinageminicio,
        usinagemfim = p_usinagemfim,
        usinagemresp = p_usinagemresp,
        usinagempausa = p_usinagempausa,
        
        montageminicio = p_montageminicio,
        montagemfim = p_montagemfim,
        montagemresp = p_montagemresp,
        montagempausa = p_montagempausa,

        paineisinicio = p_paineisinicio,
        paineisfim = p_paineisfim,
        paineisresp = p_paineisresp,
        paineispausa = p_paineispausa,

        acabamentoinicio = p_acabamentoinicio,
        acabamentofim = p_acabamentofim,
        acabamentoresp = p_acabamentoresp,
        acabamentopausa = p_acabamentopausa,

        embalageminicio = p_embalageminicio,
        embalagemfim = p_embalagemfim,
        embalagemresp = p_embalagemresp,
        embalagempausa = p_embalagempausa,

        observacoes = p_observacoes
    WHERE ordemdecompra = p_ordemdecompra;

    UPDATE "tblProjetos" SET previsao = p_previsao
    WHERE ordemdecompra = p_ordemdecompra;

    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    
    RETURN QUERY 
    SELECT v_rows_affected;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_data_producao(p_ordemdecompra bigint, p_corteinicio timestamp without time zone, p_cortefim timestamp without time zone, p_corteresp smallint, p_cortepausa boolean, p_customizacaoinicio timestamp without time zone, p_customizacaofim timestamp without time zone, p_customizacaoresp smallint, p_customizacaopausa boolean, p_coladeirainicio timestamp without time zone, p_coladeirafim timestamp without time zone, p_coladeiraresp smallint, p_coladeirapausa boolean, p_usinageminicio timestamp without time zone, p_usinagemfim timestamp without time zone, p_usinagemresp smallint, p_usinagempausa boolean, p_montageminicio timestamp without time zone, p_montagemfim timestamp without time zone, p_montagemresp smallint, p_montagempausa boolean, p_paineisinicio timestamp without time zone, p_paineisfim timestamp without time zone, p_paineisresp smallint, p_paineispausa boolean, p_acabamentoinicio timestamp without time zone, p_acabamentofim timestamp without time zone, p_acabamentoresp smallint, p_acabamentopausa boolean, p_observacoes text)
 RETURNS TABLE(rows_affected integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE 
    v_rows_affected int;
BEGIN
    UPDATE "tblProducao" SET 
        corteinicio = p_corteinicio,
        cortefim = p_cortefim,
        corteresp = p_corteresp,
        cortepausa = p_cortepausa,

        customizacaoinicio = p_customizacaoinicio,
        customizacaofim = p_customizacaofim,
        customizacaoresp = p_customizacaoresp,
        customizacaopausa = p_customizacaopausa,

        coladeirainicio = p_coladeirainicio,
        coladeirafim = p_coladeirafim,
        coladeiraresp = p_coladeiraresp,
        coladeirapausa = p_coladeirapausa,

        usinageminicio = p_usinageminicio,
        usinagemfim = p_usinagemfim,
        usinagemresp = p_usinagemresp,
        usinagempausa = p_usinagempausa,
        
        montageminicio = p_montageminicio,
        montagemfim = p_montagemfim,
        montagemresp = p_montagemresp,
        montagempausa = p_montagempausa,

        paineisinicio = p_paineisinicio,
        paineisfim = p_paineisfim,
        paineisresp = p_paineisresp,
        paineispausa = p_paineispausa,

        acabamentoinicio = p_acabamentoinicio,
        acabamentofim = p_acabamentofim,
        acabamentoresp = p_acabamentoresp,
        acabamentopausa = p_acabamentopausa,

        observacoes = p_observacoes
    WHERE ordemdecompra = p_ordemdecompra;

    GET DIAGNOSTICS v_rows_affected = ROW_COUNT;
    
    RETURN QUERY 
    SELECT v_rows_affected;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_acessorios_compras(p_dataentrega date)
 RETURNS TABLE(id bigint, ordemdecompra bigint, contrato bigint, cliente text, ambiente text, descricao text, medida text, parcelamento smallint, numcard text, qtd smallint, fornecedor text, chegoufabrica date, dataentrega date, datacompra date, previsao date, recebido date, status text, categoria text)
 LANGUAGE plpgsql
AS $function$
begin
  RETURN QUERY
    SELECT 
    "tblAcessorios".id,
    "tblProjetos".ordemdecompra,
    "tblProjetos".contrato,
    "tblProjetos".cliente,
    "tblProjetos".ambiente,
    "tblAcessorios".descricao,
    "tblAcessorios".medida,
    "tblAcessorios".parcelamento,
    "tblAcessorios".numcard,
    "tblAcessorios".qtd,
    "tblAcessorios".fornecedor,
    "tblProjetos".chegoufabrica,
    "tblProjetos".dataentrega,
    "tblAcessorios".datacompra,
    "tblAcessorios".previsao,
    "tblAcessorios".recebido,
    CASE 
      WHEN "tblAcessorios".recebido IS NOT NULL THEN 'ENTREGUE'
      WHEN "tblProjetos".pendencia and "tblAcessorios".recebido IS NULL THEN 'PENDENCIA'
      WHEN "tblProjetos".dataentrega < current_date AND "tblAcessorios".recebido IS NULL THEN 'ATRASADO'
      WHEN "tblProjetos".dataentrega < current_date + interval '10 days' THEN 'A VENCER'
      ELSE 'AGUARDANDO'
    END AS status,
    "tblAcessorios".categoria
    FROM "tblProjetos"
    INNER JOIN "tblAcessorios" ON "tblProjetos".ordemdecompra = "tblAcessorios".ordemdecompra
    WHERE 
      (CASE 
      WHEN "tblAcessorios".recebido IS NOT NULL THEN 'ENTREGUE'
      WHEN "tblProjetos".pendencia and "tblAcessorios".recebido IS NULL THEN 'PENDENCIA'
      WHEN "tblProjetos".dataentrega < current_date AND "tblAcessorios".recebido IS NULL THEN 'ATRASADO'
      WHEN "tblProjetos".dataentrega < current_date + interval '10 days' THEN 'A VENCER'
      ELSE 'AGUARDANDO'
    END) IN ('PENDENCIA', 'ATRASADO', 'A VENCER', 'AGUARDANDO', 'ENTREGUE') and "tblProjetos".dataentrega > p_dataentrega
    ORDER BY "tblProjetos".dataentrega, "tblProjetos".cliente, "tblProjetos".ambiente, "tblAcessorios".categoria, "tblAcessorios".descricao;
  END;
$function$;

CREATE OR REPLACE FUNCTION public.set_acessorios(p_id integer, p_descricao text, p_medida text, p_parcelamento smallint, p_numcard text, p_qtd smallint, p_fornecedor text, p_datacompra date, p_previsao date, p_recebido date)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE "tblAcessorios"
  SET
    descricao = p_descricao,
    medida = p_medida,
    parcelamento  = p_parcelamento,
    numcard  = p_numcard,
    qtd = p_qtd,
    fornecedor = p_fornecedor,
    datacompra = p_datacompra,
    previsao = p_previsao,
    recebido = p_recebido
  WHERE id = p_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_operadores()
 RETURNS TABLE(p_id smallint, p_nome text)
 LANGUAGE plpgsql
AS $function$
  begin 
    return query
    select id, login from "tblUsuario"
    where ativo = true and local = 'FABRICA'
    order by login;
  end;
$function$;

CREATE OR REPLACE FUNCTION public.get_max_id()
 RETURNS TABLE(max_id integer)
 LANGUAGE plpgsql
AS $function$
BEGIN 
  RETURN QUERY
  Select (MAX(id)+1) as max_id from "tblUsuario";
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_project_producao()
 RETURNS TABLE(total bigint, a text, "Pedido" smallint, "Etapa" text, "CodCC" integer, "Cliente" text, "Contrato" bigint, "Numproj" text, "Ambiente" text, "Tipo" text, "Recebido" date, "Dataentrega" date, "Status" text, "Iniciado" date, "Previsao" date, "Pronto" date, "Entrega" date)
 LANGUAGE plpgsql
AS $function$
BEGIN
    SET TIMEZONE TO 'America/Sao_Paulo';
    RETURN QUERY
        SELECT (SELECT COUNT("tblAcessorios".ordemdecompra) - COUNT("tblAcessorios".recebido) 
        FROM "tblAcessorios" 
        WHERE "tblAcessorios".ordemdecompra = "tblProjetos".ordemdecompra) AS "total",
        CASE 
            WHEN EXISTS (SELECT 1 FROM "tblAcessorios" WHERE "tblAcessorios".ordemdecompra = "tblProjetos".ordemdecompra) THEN '*'
            ELSE ''
        END AS "a",
        "pedido",
        "etapa",
        "codcc",
        "cliente",
        "contrato",
        "numproj",
        "ambiente",
        "tipo",
        "chegoufabrica",
        "dataentrega",
        CASE 
        WHEN "tblProjetos".pendencia THEN 'PENDENCIA'
        WHEN "tblProjetos".entrega notnull THEN 'ENTREGUE'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE THEN 'ATRASADO'
        WHEN "tblProjetos".iniciado notnull AND "tblProjetos".urgente AND "tblProjetos".pronto notnull THEN 'PRONTO'
        WHEN "tblProjetos".iniciado notnull AND "tblProjetos".urgente THEN 'URGENTE'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE - INTERVAL '1 day' AND "tblProjetos".pronto notnull THEN 'PRONTO'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE + INTERVAL '7 days' AND "tblProjetos".pronto notnull THEN 'PRONTO'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE + INTERVAL '7 days' THEN 'A VENCER'
        WHEN "tblProjetos".pronto notnull THEN 'PRONTO'
        WHEN "tblProjetos".iniciado notnull THEN 'INICIADO'
        ELSE 'AGUARDANDO'
    END AS status,
        "iniciado",
        "previsao",
        "pronto",
        "entrega"
        FROM "tblProjetos"
        WHERE
        CASE 
        WHEN "tblProjetos".pendencia THEN 'PENDENCIA'
        WHEN "tblProjetos".entrega notnull THEN 'ENTREGUE'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE THEN 'ATRASADO'
        WHEN "tblProjetos".iniciado notnull AND "tblProjetos".urgente AND "tblProjetos".pronto notnull THEN 'PRONTO'
        WHEN "tblProjetos".iniciado notnull AND "tblProjetos".urgente THEN 'URGENTE'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE - INTERVAL '1 day' AND "tblProjetos".pronto notnull THEN 'PRONTO'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE + INTERVAL '7 days' AND "tblProjetos".pronto notnull THEN 'PRONTO'
        WHEN "tblProjetos".dataentrega < CURRENT_DATE + INTERVAL '7 days' THEN 'A VENCER'
        WHEN "tblProjetos".pronto notnull THEN 'PRONTO'
        WHEN "tblProjetos".iniciado notnull THEN 'INICIADO'
        ELSE 'AGUARDANDO'
    END IN ('INICIADO', 'ATRASADO', 'A VENCER', 'URGENTE', 'PENDENCIA', 'PRONTO');
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_group_by_liberador()
 RETURNS TABLE(p_liberador text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
        SELECT liberador FROM "tblProjetos" GROUP BY liberador ORDER BY liberador;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_group_by_tipoambiente()
 RETURNS TABLE(tipo_ambiente text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
        SELECT tipoambiente FROM "tblProjetos" GROUP BY tipoambiente ORDER BY tipoambiente;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_group_by_vendedor()
 RETURNS TABLE(p_vendedor text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
        SELECT vendedor FROM "tblProjetos" GROUP BY vendedor ORDER BY vendedor;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_data(p_id integer, p_date date)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
  begin
    UPDATE "tblDatas" SET data = p_date where id = p_id;
  end;
$function$;

CREATE OR REPLACE FUNCTION public.get_producao(p_ordemdecompra bigint)
 RETURNS TABLE(ordemdecompra bigint, cliente text, contrato bigint, codcc integer, ambiente text, numproj text, lote integer, chegoufabrica date, dataentrega date, previsao date, corteinicio timestamp without time zone, cortefim timestamp without time zone, cortepausa boolean, corteresp smallint, customizacaoinicio timestamp without time zone, customizacaofim timestamp without time zone, customizacaopausa boolean, customizacaoresp smallint, coladeirainicio timestamp without time zone, coladeirafim timestamp without time zone, coladeirapausa boolean, coladeiraresp smallint, usinageminicio timestamp without time zone, usinagemfim timestamp without time zone, usinagempausa boolean, usinagemresp smallint, montageminicio timestamp without time zone, montagemfim timestamp without time zone, montagempausa boolean, montagemresp smallint, paineisinicio timestamp without time zone, paineisfim timestamp without time zone, paineispausa boolean, paineisresp smallint, acabamentoinicio timestamp without time zone, acabamentofim timestamp without time zone, acabamentopausa boolean, acabamentoresp smallint, embalageminicio timestamp without time zone, embalagemfim timestamp without time zone, embalagempausa boolean, embalagemresp smallint, observacoes text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RAISE NOTICE 'Iniciando a execução da função com ordemdecompra: %', p_ordemdecompra;
    RETURN QUERY
    SELECT 
    "tblProjetos".ordemdecompra,
    "tblProjetos".cliente,
    "tblProjetos".contrato,
    "tblProjetos".codcc,
    "tblProjetos".ambiente,
    "tblProjetos".numproj,
    "tblProjetos".lote,
    "tblProjetos".chegoufabrica,
    "tblProjetos".dataentrega,
    "tblProjetos".previsao,

    "tblProducao".corteinicio, 
    "tblProducao".cortefim, 
    "tblProducao".cortepausa, 
    "tblProducao".corteresp,

    "tblProducao".customizacaoinicio, 
    "tblProducao".customizacaofim, 
    "tblProducao".customizacaopausa,
    "tblProducao".customizacaoresp, 

    "tblProducao".coladeirainicio, 
    "tblProducao".coladeirafim, 
    "tblProducao".coladeirapausa,
    "tblProducao".coladeiraresp, 

    "tblProducao".usinageminicio, 
    "tblProducao".usinagemfim, 
    "tblProducao".usinagempausa,
    "tblProducao".usinagemresp, 

    "tblProducao".montageminicio, 
    "tblProducao".montagemfim, 
    "tblProducao".montagempausa,
    "tblProducao".montagemresp, 

    "tblProducao".paineisinicio, 
    "tblProducao".paineisfim, 
    "tblProducao".paineispausa,
    "tblProducao".paineisresp,

    "tblProducao".acabamentoinicio,
    "tblProducao".acabamentofim,
    "tblProducao".acabamentopausa,
    "tblProducao".acabamentoresp,

    "tblProducao".embalageminicio,
    "tblProducao".embalagemfim,
    "tblProducao".embalagempausa,
    "tblProducao".embalagemresp,

    "tblProducao".observacoes

    FROM "tblProjetos" INNER JOIN "tblProducao" ON "tblProjetos".ordemdecompra = "tblProducao".ordemdecompra
    WHERE "tblProjetos".ordemdecompra = p_ordemdecompra;
END;
$function$;

CREATE OR REPLACE FUNCTION public.insert_usuario(p_id bigint, p_login text, p_senha text, p_setor text, p_camiseta text, p_calca text, p_sapato text, p_local text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  INSERT INTO "tblUsuario" (
    id,
    login,
    senha,
    setor,
    camiseta,
    calca,
    sapato,
    local
  ) VALUES (
    p_id,
    p_login,
    p_senha,
    p_setor,
    p_camiseta,
    p_calca,
    p_sapato,
    p_local
  );
  END;
  $function$;

CREATE OR REPLACE FUNCTION public.get_usuario(p_id smallint)
 RETURNS TABLE(nome text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT login FROM "tblUsuario" WHERE id = p_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_delete_projeto(p_ordemdecompra bigint)
 RETURNS void
 LANGUAGE plpgsql
AS $function$begin
  delete from "tblAcessorios" where ordemdecompra = p_ordemdecompra;
  delete from "tblAvulsos" where ordemdecompra = p_ordemdecompra;
  delete from "tblProducao" where ordemdecompra = p_ordemdecompra;
  delete from "tblProjetos" where ordemdecompra = p_ordemdecompra;
end;$function$;

CREATE OR REPLACE FUNCTION public.get_expedicao(p_ordemdecompra bigint)
 RETURNS TABLE(ordemdecompra bigint, cliente text, contrato bigint, codcc integer, ambiente text, numproj text, lote integer, chegoufabrica date, dataentrega date, pronto date, entrega date, pendencia boolean, parcial boolean, separacao timestamp without time zone, conferido smallint, motorista smallint, embalageminicio timestamp without time zone, embalagemfim timestamp without time zone, embalagempausa boolean, embalagemresp smallint, avulso boolean, avulsol text, avulsoq smallint, cabide boolean, cabidel text, cabideq smallint, paineis boolean, paineisl text, paineisq smallint, pecaspintadas boolean, pecaspintadasl text, pecaspintadasq smallint, portaaluminio boolean, portaaluminiol text, portaaluminioq smallint, serralheria boolean, serralherial text, serralheriaq smallint, tapecaria boolean, tapecarial text, tapecariaq smallint, trilho boolean, trilhol text, trilhoq smallint, vidros boolean, vidrosl text, vidrosq smallint, volmod boolean, modulosl text, modulosq smallint, totalvolumes smallint, tamanho text, observacoes text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    SET TIMEZONE TO 'America/Sao_Paulo';
    RETURN QUERY
    SELECT 
        "tblProjetos".ordemdecompra, 
        "tblProjetos".cliente, 
        "tblProjetos".contrato,
        "tblProjetos".codcc,
        "tblProjetos".ambiente,
        "tblProjetos".numproj,
        "tblProjetos".lote,
        "tblProjetos".chegoufabrica,
        "tblProjetos".dataentrega,
        "tblProjetos".pronto,
        "tblProjetos".entrega,
        "tblProjetos".pendencia,
        "tblProjetos".parceado,
        "tblProducao".separacao,
        "tblProducao".conferido,
        "tblProducao".motorista,
        "tblProducao".embalageminicio,
        "tblProducao".embalagemfim,
        "tblProducao".embalagempausa,
        "tblProducao".embalagemresp,
        "tblAvulsos".avulso,
        "tblAvulsos".avulsol,
        "tblAvulsos".avulsoq,
        "tblAvulsos".cabide,
        "tblAvulsos".cabidel,
        "tblAvulsos".cabideq,
        "tblAvulsos".paineis,
        "tblAvulsos".paineisl,
        "tblAvulsos".paineisq,
        "tblAvulsos".pecaspintadas,
        "tblAvulsos".pecaspintadasl,
        "tblAvulsos".pecaspintadasq,
        "tblAvulsos".portaaluminio,
        "tblAvulsos".portaaluminiol,
        "tblAvulsos".portaaluminioq,
        "tblAvulsos".serralheria,
        "tblAvulsos".serralherial,
        "tblAvulsos".serralheriaq,
        "tblAvulsos".tapecaria,
        "tblAvulsos".tapecarial,
        "tblAvulsos".tapecariaq,
        "tblAvulsos".trilho,
        "tblAvulsos".trilhol,
        "tblAvulsos".trilhoq,
        "tblAvulsos".vidros,
        "tblAvulsos".vidrosl,
        "tblAvulsos".vidrosq,
        "tblAvulsos".volmod,
        "tblAvulsos".modulosl,
        "tblAvulsos".modulosq,
        "tblAvulsos".totalvolumes,
        "tblProducao".tamanho,
        "tblProducao".observacoes
    FROM 
        "tblProjetos"
    INNER JOIN "tblProducao" ON "tblProjetos".ordemdecompra = "tblProducao".ordemdecompra
    INNER JOIN "tblAvulsos" ON "tblProducao".ordemdecompra = "tblAvulsos".ordemdecompra
    WHERE 
        "tblProjetos".ordemdecompra = p_ordemdecompra;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_senha(p_id integer, p_senha text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$

BEGIN

  UPDATE "tblUsuario" SET 
    senha = p_senha
    WHERE id = p_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_contrato(p_contrato bigint)
 RETURNS TABLE(p_cliente text, p_vendedor text, p_liberador text, p_datacontrato date, p_dataassinatura date, p_chegoufabrica date, p_dataentrega date, p_loja text, p_tipocliente text, p_etapa text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        cliente,
        vendedor,
        liberador,
        datacontrato,
        dataassinatura,
        chegoufabrica,
        dataentrega,
        loja,
        tipocliente,
        etapa
    FROM 
        "tblProjetos" 
    WHERE 
        contrato = p_contrato;
    end;
$function$;

CREATE OR REPLACE FUNCTION public.get_name_id(p_id integer)
 RETURNS SETOF "tblUsuario"
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT * FROM "tblUsuario" WHERE id = p_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_acesso(p_id integer)
 RETURNS TABLE(login text, setor text, camiseta text, calca text, sapato text, local text, ativo boolean, projetos boolean, producao boolean, expedicao boolean, usuarios boolean, acessos boolean, definicoes boolean, pcp boolean, previsao boolean, compras boolean, solicitacao boolean, prodass boolean, valores boolean, logistica boolean)
 LANGUAGE plpgsql
AS $function$

BEGIN 
  RETURN QUERY 
  SELECT 
  "tblUsuario".login,
  "tblUsuario".setor,
  "tblUsuario".camiseta,
  "tblUsuario".calca,
  "tblUsuario".sapato,
  "tblUsuario".local,
  "tblUsuario".ativo,
  "tblUsuario".adicionar_projetos,
  "tblUsuario".producao,
  "tblUsuario".expedicao,
  "tblUsuario".adicionar_usuarios,
  "tblUsuario".acesso,
  "tblUsuario".definicoes,
  "tblUsuario".pcp,
  "tblUsuario".previsao,
  "tblUsuario".compras,
  "tblUsuario".solicitar_assistencia,
  "tblUsuario".producao_assistencia,
  "tblUsuario".valores,
  "tblUsuario".logistica
  FROM "tblUsuario" WHERE id = p_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_iniciar_lote(p_iniciado date, p_lote integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  UPDATE "tblProjetos" set
  iniciado = p_iniciado
  WHERE lote = p_lote;
end;
$function$;

CREATE OR REPLACE FUNCTION public.get_projetos_recebidos(p_inicio date, p_fim date)
 RETURNS TABLE(p_ordemdecompra bigint, p_contrato bigint, p_cliente text, p_ambiente text, p_numproj text, p_chegoufabrica date, p_dataentrega date, p_vendedor text)
 LANGUAGE plpgsql
AS $function$
begin
  RETURN Query
  SELECT ordemdecompra, contrato, cliente, ambiente, numproj, chegoufabrica, dataentrega, vendedor
  FROM "tblProjetos"
  WHERE chegoufabrica >= p_inicio and chegoufabrica <= p_fim;
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_expedicao(p_ordemdecompra bigint, p_pronto date, p_entrega date, p_pendencia boolean, p_parcial boolean, p_separacao timestamp without time zone, p_conferido smallint, p_motorista smallint, p_embalageminicio timestamp without time zone, p_embalagemfim timestamp without time zone, p_embalagempausa boolean, p_embalagemresp smallint, p_avulso boolean, p_avulsol text, p_avulsoq smallint, p_cabide boolean, p_cabidel text, p_cabideq smallint, p_paineis boolean, p_paineisl text, p_paineisq smallint, p_pecaspintadas boolean, p_pecaspintadasl text, p_pecaspintadasq smallint, p_portaaluminio boolean, p_portaaluminiol text, p_portaaluminioq smallint, p_serralheria boolean, p_serralherial text, p_serralheriaq smallint, p_tapecaria boolean, p_tapecarial text, p_tapecariaq smallint, p_trilho boolean, p_trilhol text, p_trilhoq smallint, p_vidros boolean, p_vidrosl text, p_vidrosq smallint, p_volmod boolean, p_modulosl text, p_modulosq smallint, p_totalvolumes smallint, p_tamanho text, p_observacoes text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Check if the order exists
    IF NOT EXISTS (SELECT 1 FROM "tblProjetos" WHERE ordemdecompra = p_ordemdecompra) THEN
        RAISE EXCEPTION 'Order with ordemdecompra % does not exist', p_ordemdecompra;
    END IF;

    -- Update tblProjetos
    UPDATE "tblProjetos"
    SET
        pronto = p_pronto,
        entrega = p_entrega,
        pendencia = p_pendencia,
        parceado = p_parcial
    WHERE ordemdecompra = p_ordemdecompra;

    -- Update tblProducao
    UPDATE "tblProducao"
    SET
        separacao = p_separacao,
        conferido = p_conferido,
        motorista = p_motorista,
        embalageminicio = p_embalageminicio,
        embalagemfim = p_embalagemfim,
        embalagempausa = p_embalagempausa,
        embalagemresp = p_embalagemresp,
        tamanho = p_tamanho,
        observacoes = p_observacoes
    WHERE ordemdecompra = p_ordemdecompra;

    -- Update tblAvulsos
    UPDATE "tblAvulsos"
    SET
        avulso = p_avulso,
        avulsol = p_avulsol,
        avulsoq = p_avulsoq,
        cabide = p_cabide,
        cabidel = p_cabidel,
        cabideq = p_cabideq,
        paineis = p_paineis,
        paineisl = p_paineisl,
        paineisq = p_paineisq,
        pecaspintadas = p_pecaspintadas,
        pecaspintadasl = p_pecaspintadasl,
        pecaspintadasq = p_pecaspintadasq,
        portaaluminio = p_portaaluminio,
        portaaluminiol = p_portaaluminiol,
        portaaluminioq = p_portaaluminioq,
        serralheria = p_serralheria,
        serralherial = p_serralherial,
        serralheriaq = p_serralheriaq,
        tapecaria = p_tapecaria,
        tapecarial = p_tapecarial,
        tapecariaq = p_tapecariaq,
        trilho = p_trilho,
        trilhol = p_trilhol,
        trilhoq = p_trilhoq,
        vidros = p_vidros,
        vidrosl = p_vidrosl,
        vidrosq = p_vidrosq,
        volmod = p_volmod,
        modulosl = p_modulosl,
        modulosq = p_modulosq,
        totalvolumes = p_totalvolumes
    WHERE ordemdecompra = p_ordemdecompra;

END;
$function$;

CREATE OR REPLACE FUNCTION public.get_delete_projetos(p_ordemdecompra bigint)
 RETURNS TABLE(contrato bigint, cliente text, tipoambiente text, ambiente text, numproj text, vendedor text, liberador text, datacontrato date, dataassinatura date, chegoufabrica date, dataentrega date, loja text, tipocliente text, etapa text, tipocontrato text, valorbruto real, valornegociado real, customaterial real, customaterialadicional real)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        "tblProjetos".contrato,
        "tblProjetos".cliente,
        "tblProjetos".tipoambiente,
        "tblProjetos".ambiente,
        "tblProjetos".numproj,
        "tblProjetos".vendedor,
        "tblProjetos".liberador,
        "tblProjetos".datacontrato,
        "tblProjetos".dataassinatura,
        "tblProjetos".chegoufabrica,
        "tblProjetos".dataentrega,
        "tblProjetos".loja,
        "tblProjetos".tipocliente,
        "tblProjetos".etapa,
        "tblProjetos".tipocontrato,
        "tblProjetos".valorbruto,
        "tblProjetos".valornegociado,
        "tblProjetos".customaterial,
        "tblProjetos".customaterialadicional
    FROM 
        "tblProjetos"
    WHERE 
        "tblProjetos".ordemdecompra = p_ordemdecompra;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_edit_projetos(p_ordemdecompra bigint)
 RETURNS TABLE(contrato bigint, cliente text, tipoambiente text, ambiente text, numproj text, vendedor text, liberador text, datacontrato date, dataassinatura date, chegoufabrica date, dataentrega date, loja text, tipocliente text, etapa text, tipocontrato text, valorbruto real, valornegociado real, customaterial real, customaterialadicional real)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        "tblProjetos".contrato,
        "tblProjetos".cliente,
        "tblProjetos".tipoambiente,
        "tblProjetos".ambiente,
        "tblProjetos".numproj,
        "tblProjetos".vendedor,
        "tblProjetos".liberador,
        "tblProjetos".datacontrato,
        "tblProjetos".dataassinatura,
        "tblProjetos".chegoufabrica,
        "tblProjetos".dataentrega,
        "tblProjetos".loja,
        "tblProjetos".tipocliente,
        "tblProjetos".etapa,
        "tblProjetos".tipocontrato,
        "tblProjetos".valorbruto,
        "tblProjetos".valornegociado,
        "tblProjetos".customaterial,
        "tblProjetos".customaterialadicional
    FROM 
        "tblProjetos"
    WHERE 
        "tblProjetos".ordemdecompra = p_ordemdecompra;
        
END;
$function$;

CREATE OR REPLACE FUNCTION public.insert_projeto(p_contrato bigint, p_ordemdecompra bigint, p_cliente text, p_tipoambiente text, p_ambiente text, p_numproj text, p_vendedor text, p_liberador text, p_datacontrato date, p_dataassinatura date, p_chegoufabrica date, p_dataentrega date, p_loja text, p_tipocliente text, p_etapa text, p_tipocontrato text, p_valorbruto double precision, p_valornegociado double precision, p_customaterial double precision, p_custoadicional double precision)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO "tblProjetos" (
        contrato,
        ordemdecompra,
        cliente,
        tipoambiente,
        ambiente,
        numproj,
        vendedor,
        liberador,
        datacontrato,
        dataassinatura,
        chegoufabrica,
        dataentrega,
        previsao,
        loja,
        tipocliente,
        etapa,
        tipocontrato,
        valorbruto,
        valornegociado,
        customaterial,
        customaterialadicional

    ) VALUES (
        p_contrato,
        p_ordemdecompra,
        p_cliente,
        p_tipoambiente,
        p_ambiente,
        p_numproj,
        p_vendedor,
        p_liberador,
        p_datacontrato,
        p_dataassinatura,
        p_chegoufabrica,
        p_dataentrega,
        p_dataentrega,
        p_loja,
        p_tipocliente,
        p_etapa,
        p_tipocontrato,
        p_valorbruto,
        p_valornegociado,
        p_customaterial,
        p_custoadicional
    );

    INSERT INTO "tblProducao" (
        ordemdecompra
    ) VALUES (
        p_ordemdecompra
    );

    INSERT INTO "tblAvulsos" (
        ordemdecompra
    ) VALUES (
        p_ordemdecompra
    );

END;
$function$;

CREATE OR REPLACE FUNCTION public.set_acesso(p_id integer, p_login text, p_setor text, p_camiseta text, p_calca text, p_sapato text, p_local text, p_ativo boolean, p_projetos boolean, p_producao boolean, p_expedicao boolean, p_usuarios boolean, p_acessos boolean, p_definicoes boolean, p_calcular boolean, p_previsoes boolean, p_compras boolean, p_solicitacao boolean, p_prodass boolean, p_valores boolean, p_logistica boolean)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  UPDATE "tblUsuario" SET 
  login = p_login,
  setor = p_setor,
  camiseta = p_camiseta,
  calca = p_calca,
  sapato = p_sapato,
  local = p_local,
  ativo = p_ativo,
  adicionar_projetos = p_projetos,
  producao = p_producao,
  expedicao = p_expedicao,
  adicionar_usuarios = p_usuarios,
  acesso = p_acessos,
  definicoes = p_definicoes,
  pcp = p_calcular,
  previsao = p_previsoes,
  compras = p_compras,
  solicitar_assistencia = p_solicitacao,
  producao_assistencia = p_prodass,
  valores = p_valores,
  logistica = p_logistica
  WHERE id = p_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_data_producao(p_ordemdecompra bigint, p_corteinicio timestamp without time zone, p_cortefim timestamp without time zone, p_corteresp smallint, p_cortepausa boolean, p_customizacaoinicio timestamp without time zone, p_customizacaofim timestamp without time zone, p_customizacaoresp smallint, p_customizacaopausa boolean, p_coladeirainicio timestamp without time zone, p_coladeirafim timestamp without time zone, p_coladeiraresp smallint, p_coladeirapausa boolean, p_usinageminicio timestamp without time zone, p_usinagemfim timestamp without time zone, p_usinagemresp smallint, p_usinagempausa boolean, p_montageminicio timestamp without time zone, p_montagemfim timestamp without time zone, p_montagemresp smallint, p_montagempausa boolean, p_paineisinicio timestamp without time zone, p_paineisfim timestamp without time zone, p_paineisresp smallint, p_paineispausa boolean, p_observacoes text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$

BEGIN

  UPDATE "tblProducao" SET 
    corteinicio = p_corteinicio,
    cortefim = p_cortefim,
    corteresp = p_corteresp,
    cortepausa = p_cortepausa,

    customizacaoinicio = p_customizacaoinicio,
    customizacaofim = p_customizacaofim,
    customizacaoresp = p_customizacaoresp,
    customizacaopausa = p_customizacaopausa,

    coladeirainicio = p_coladeirainicio,
    coladeirafim = p_coladeirafim,
    coladeiraresp = p_coladeiraresp,
    coladeirapausa = p_coladeirapausa,

    usinageminicio = p_usinageminicio,
    usinagemfim = p_usinagemfim,
    usinagemresp = p_usinagemresp,
    usinagempausa = p_usinagempausa,
    
    montageminicio = p_montageminicio,
    montagemfim = p_montagemfim,
    montagemresp = p_montagemresp,
    montagempausa = p_montagempausa,

    paineisinicio = p_paineisinicio,
    paineisfim = p_paineisfim,
    paineisresp = p_paineisresp,
    paineispausa = p_paineispausa,
    observacoes = p_observacoes

    WHERE ordemdecompra = p_ordemdecompra;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_edit_projetos(p_ordemdecompra bigint, p_contrato bigint, p_cliente text, p_tipoambiente text, p_ambiente text, p_numproj text, p_vendedor text, p_liberador text, p_datacontrato date, p_dataassinatura date, p_chegoufabrica date, p_dataentrega date, p_loja text, p_tipocliente text, p_etapa text, p_tipocontrato text, p_valorbruto real, p_valornegociado real, p_customaterial real, p_customaterialadicional real)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE "tblProjetos" SET 
    contrato = p_contrato,
    cliente = p_cliente,
    tipoambiente = p_tipoambiente,
    ambiente = p_ambiente,
    numproj = p_numproj,
    vendedor = p_vendedor,
    liberador = p_liberador,
    datacontrato = p_datacontrato,
    dataassinatura = p_dataassinatura,
    chegoufabrica = p_chegoufabrica,
    dataentrega = p_dataentrega,
    loja = p_loja,
    tipocliente = p_tipocliente,
    etapa = p_etapa,
    tipocontrato = p_tipocontrato,
    valorbruto = p_valorbruto,
    valornegociado = p_valornegociado,
    customaterial = p_customaterial,
    customaterialadicional = p_customaterialadicional
  WHERE "tblProjetos".ordemdecompra = p_ordemdecompra;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_projetos_pcp(p_ordemdecompra bigint)
 RETURNS TABLE(p_contrato bigint, p_urgente boolean, p_cliente text, p_codcc integer, p_ambiente text, p_numproj text, p_lote integer, p_pedido smallint, p_chegoufabrica date, p_dataentrega date, p_tipo text, "p_peças" smallint, p_area real)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
  contrato,
  urgente, 
  cliente, 
  codcc, 
  ambiente, 
  numproj, 
  lote, 
  pedido, 
  chegoufabrica, 
  dataentrega, 
  tipo, 
  peças, 
  area 
  FROM "tblProjetos"
  WHERE ordemdecompra = p_ordemdecompra;
  END;
$function$;

CREATE OR REPLACE FUNCTION public.get_valores()
 RETURNS TABLE(p_ordemdecompra bigint, p_contrato bigint, p_cliente text, p_numproj text, p_ambiente text, p_valorbruto real, p_valornegociado real, p_customaterial real, p_desconto double precision, p_lucrobruto real, p_margem double precision)
 LANGUAGE plpgsql
AS $function$
begin
  return query
  SELECT 
  ordemdecompra,
  contrato,
  cliente,
  numproj,
  ambiente,
  valorbruto,
  valornegociado,
  customaterial,
  CASE 
    WHEN valorbruto = 0 OR valornegociado = 0 THEN 0  -- Se valorbruto ou valornegociado for zero, retorna 0
    ELSE ((valorbruto - valornegociado) / valorbruto) * 100 
  END AS desconto,
  CASE 
    WHEN valornegociado = 0 OR customaterial = 0 THEN 0  -- Se valornegociado ou customaterial for zero, retorna 0
    ELSE valornegociado - customaterial 
  END AS lucrobruto,
  CASE 
    WHEN valornegociado = 0 OR customaterial = 0 THEN 0  -- Se valornegociado ou customaterial for zero, retorna 0
    ELSE ((valornegociado - customaterial) / valornegociado) * 100 
  END AS margem
FROM "tblProjetos";
  END;
$function$;

CREATE OR REPLACE FUNCTION public.get_acessorios_pendencias(p_ordemdecompra bigint)
 RETURNS TABLE(p_id bigint, p_categoria text, p_descricao text, p_medida text, p_qtd smallint, p_fornecedor text, p_datacompra date, p_previsao date, p_recebido date)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
  id, 
  categoria, 
  descricao, 
  medida, 
  qtd, 
  fornecedor, 
  datacompra, 
  previsao, 
  recebido 
  FROM "tblAcessorios" 
  WHERE ordemdecompra = p_ordemdecompra;
  END;
$function$;

CREATE OR REPLACE FUNCTION public.set_infocapa(p_ordemdecompra bigint, p_tipo text, p_urgente boolean)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN 
  UPDATE "tblProjetos" SET tipo = p_tipo, urgente = p_urgente
  WHERE ordemdecompra = p_ordemdecompra;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_projeto_capa(p_ordemdecompra bigint)
 RETURNS TABLE(p_codcc integer, p_lote integer, p_pedido smallint, p_cliente text, p_ambiente text, p_vendedor text, p_liberador text, p_dataentrega date, p_tipo text, p_contrato bigint, p_numproj text, p_observacoes text, p_urgente boolean, p_corteinicio timestamp without time zone, p_cortefim timestamp without time zone, p_cortepausa boolean, p_corte_resp text, p_customizacaoinicio timestamp without time zone, p_customizacaofim timestamp without time zone, p_customizacaopausa boolean, p_customizacao_resp text, p_coladeirainicio timestamp without time zone, p_coladeirafim timestamp without time zone, p_coladeirapausa boolean, p_coladeira_resp text, p_usinageminicio timestamp without time zone, p_usinagemfim timestamp without time zone, p_usinagempausa boolean, p_usinagem_resp text, p_montageminicio timestamp without time zone, p_montagemfim timestamp without time zone, p_montagempausa boolean, p_montagem_resp text, p_paineisinicio timestamp without time zone, p_paineisfim timestamp without time zone, p_paineispausa boolean, p_paineis_resp text, p_acabamentoinicio timestamp without time zone, p_acabamentofim timestamp without time zone, p_acabamentopausa boolean, p_acabamento_resp text, p_embalageminicio timestamp without time zone, p_embalagemfim timestamp without time zone, p_embalagempausa boolean, p_embalagem_resp text, p_motorista_resp text, p_conferido_resp text, p_pronto date, p_entrega date, p_avulso boolean, p_paineis boolean, p_portaaluminio boolean, p_vidros boolean, p_pecaspintadas boolean, p_tapecaria boolean, p_serralheria boolean, p_cabide boolean, p_trilho boolean, p_volmod boolean, p_avulsol text, p_paineisl text, p_portaaluminiol text, p_vidrosl text, p_pecaspintadasl text, p_tapecarial text, p_serralherial text, p_cabidel text, p_trilhol text, p_modulosl text, p_avulsoq smallint, p_paineisq smallint, p_portaaluminioq smallint, p_vidrosq smallint, p_pecaspintadasq smallint, p_tapecariaq smallint, p_serralheriaq smallint, p_cabideq smallint, p_trilhoq smallint, p_modulosq smallint, p_totalvolumes smallint)
 LANGUAGE plpgsql
AS $function$
BEGIN 
  return query
    SELECT
    codcc,
    lote,
    pedido,
    cliente,
    ambiente,
    vendedor,
    liberador,
    dataentrega,
    tipo,
    contrato,
    numproj,
    observacoes,
    urgente,
    corteinicio,
    cortefim,
    cortepausa boolean,
    (select login from "tblUsuario" where id = corteresp) as corte_resp,
    customizacaoinicio,
    customizacaofim,
    customizacaopausa,
    (select login from "tblUsuario" where id = customizacaoresp) as customizacao_resp,
    coladeirainicio,
    coladeirafim,
    coladeirapausa,
    (select login from "tblUsuario" where id = coladeiraresp) as coladeira_resp,
    usinageminicio,
    usinagemfim,
    usinagempausa,
    (select login from "tblUsuario" where id = usinagemresp) as usinagem_resp,
    montageminicio,
    montagemfim,
    montagempausa,
    (select login from "tblUsuario" where id = montagemresp) as montagem_resp,
    paineisinicio,
    paineisfim,
    paineispausa,
    (select login from "tblUsuario" where id = paineisresp) as paineis_resp,
    acabamentoinicio,
    acabamentofim,
    acabamentopausa,
    (select login from "tblUsuario" where id = acabamentoresp) as acabamento_resp,
    embalageminicio,
    embalagemfim,
    embalagempausa,
    (select login from "tblUsuario" where id = embalagemresp) as embalagem_resp,
    (select login from "tblUsuario" where id = motorista) as motorista_resp,
    (select login from "tblUsuario" where id = conferido) as conferido_resp,
    pronto,
    entrega,
    avulso,
    paineis,
    portaaluminio,
    vidros,
    pecaspintadas,
    tapecaria,
    serralheria,
    cabide,
    trilho,
    volmod,
    avulsol,
    paineisl,
    portaaluminiol,
    vidrosl,
    pecaspintadasl,
    tapecarial,
    serralherial,
    cabidel,
    trilhol,
    modulosl,
    avulsoq,
    paineisq,
    portaaluminioq,
    vidrosq,
    pecaspintadasq,
    tapecariaq,
    serralheriaq,
    cabideq,
    trilhoq,
    modulosq,
    totalvolumes
  FROM 
    "tblProjetos" 
    inner join "tblProducao" on "tblProjetos".ordemdecompra = "tblProducao".ordemdecompra
    inner join "tblAvulsos" on  "tblAvulsos".ordemdecompra = "tblProducao".ordemdecompra
  WHERE
    "tblProjetos".ordemdecompra = p_ordemdecompra;
  END;
$function$;

CREATE OR REPLACE FUNCTION public.get_producao_barcode(p_pedido integer)
 RETURNS TABLE(ordemdecompra bigint, cliente text, contrato bigint, codcc integer, ambiente text, numproj text, lote integer, chegoufabrica date, dataentrega date, previsao date, corteinicio timestamp without time zone, cortefim timestamp without time zone, cortepausa boolean, corteresp smallint, customizacaoinicio timestamp without time zone, customizacaofim timestamp without time zone, customizacaopausa boolean, customizacaoresp smallint, coladeirainicio timestamp without time zone, coladeirafim timestamp without time zone, coladeirapausa boolean, coladeiraresp smallint, usinageminicio timestamp without time zone, usinagemfim timestamp without time zone, usinagempausa boolean, usinagemresp smallint, montageminicio timestamp without time zone, montagemfim timestamp without time zone, montagempausa boolean, montagemresp smallint, paineisinicio timestamp without time zone, paineisfim timestamp without time zone, paineispausa boolean, paineisresp smallint, acabamentoinicio timestamp without time zone, acabamentofim timestamp without time zone, acabamentopausa boolean, acabamentoresp smallint, embalageminicio timestamp without time zone, embalagemfim timestamp without time zone, embalagempausa boolean, embalagemresp smallint, observacoes text)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RAISE NOTICE 'Iniciando a execução da função com ordemdecompra: %', p_pedido;
    RETURN QUERY
    SELECT 
    "tblProjetos".ordemdecompra,
    "tblProjetos".cliente,
    "tblProjetos".contrato,
    "tblProjetos".codcc,
    "tblProjetos".ambiente,
    "tblProjetos".numproj,
    "tblProjetos".lote,
    "tblProjetos".chegoufabrica,
    "tblProjetos".dataentrega,
    "tblProjetos".previsao,

    "tblProducao".corteinicio, 
    "tblProducao".cortefim, 
    "tblProducao".cortepausa, 
    "tblProducao".corteresp,

    "tblProducao".customizacaoinicio, 
    "tblProducao".customizacaofim, 
    "tblProducao".customizacaopausa,
    "tblProducao".customizacaoresp, 

    "tblProducao".coladeirainicio, 
    "tblProducao".coladeirafim, 
    "tblProducao".coladeirapausa,
    "tblProducao".coladeiraresp, 

    "tblProducao".usinageminicio, 
    "tblProducao".usinagemfim, 
    "tblProducao".usinagempausa,
    "tblProducao".usinagemresp, 

    "tblProducao".montageminicio, 
    "tblProducao".montagemfim, 
    "tblProducao".montagempausa,
    "tblProducao".montagemresp, 

    "tblProducao".paineisinicio, 
    "tblProducao".paineisfim, 
    "tblProducao".paineispausa,
    "tblProducao".paineisresp,

    "tblProducao".acabamentoinicio, 
    "tblProducao".acabamentofim, 
    "tblProducao".acabamentopausa,
    "tblProducao".acabamentoresp,

    "tblProducao".embalageminicio, 
    "tblProducao".embalagemfim, 
    "tblProducao".embalagempausa,
    "tblProducao".embalagemresp,

    "tblProducao".Observacoes

    FROM "tblProjetos" INNER JOIN "tblProducao" ON "tblProjetos".ordemdecompra = "tblProducao".ordemdecompra
    WHERE "tblProjetos".pedido = p_pedido;

END;
$function$;

COMMIT;
