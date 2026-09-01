// script.js — Criticidade CentroWEG
// Torna editáveis as notas de cada fator e os indicadores de parada
// (Tempo, Horas, Custo), recalcula automaticamente a Nota de Criticidade
// final (Total = produto dos 6 fatores) e mantém tudo salvo no navegador
// (localStorage), por equipamento.

(function () {
    "use strict";

    function calcularNota(valores) {
        var total = valores.reduce(function (acc, v) {
            var n = Number(v);
            return acc * (isNaN(n) ? 0 : n);
        }, 1);

        var letra;
        if (total >= 700) {
            letra = "C";
        } else if (total >= 100) {
            letra = "B";
        } else {
            letra = "A";
        }
        return { total: total, letra: letra };
    }

    function chave(maquina, campo) {
        return "criticidade:" + maquina + ":" + campo;
    }

    function aplicarClasseNota(inputNota, letra) {
        inputNota.classList.remove("nota-a", "nota-b", "nota-c");
        var l = (letra || "").trim().toLowerCase();
        if (l === "a" || l === "b" || l === "c") {
            inputNota.classList.add("nota-" + l);
        }
    }

    function iniciarCartao(cartao) {
        var titulo = cartao.querySelector("h2");
        if (!titulo) return;
        var maquina = titulo.textContent.trim();

        var camposFator = cartao.querySelectorAll(".campo-fator[data-fator]");
        var camposIndicador = cartao.querySelectorAll(".campo-fator[data-indicador]");
        var inputNota = cartao.querySelector(".campo-nota");

        // Restaura valores salvos anteriormente
        camposFator.forEach(function (input) {
            var salvo = localStorage.getItem(chave(maquina, input.dataset.fator));
            if (salvo !== null) input.value = salvo;
        });
        camposIndicador.forEach(function (input) {
            var salvo = localStorage.getItem(chave(maquina, input.dataset.indicador));
            if (salvo !== null) input.value = salvo;
        });
        if (inputNota) {
            var notaSalva = localStorage.getItem(chave(maquina, "nota"));
            if (notaSalva !== null) inputNota.value = notaSalva;
            aplicarClasseNota(inputNota, inputNota.value);
        }

        function recalcularNota() {
            if (!inputNota) return;
            var valores = Array.prototype.map.call(camposFator, function (i) {
                return i.value;
            });
            var resultado = calcularNota(valores);
            inputNota.value = resultado.letra;
            aplicarClasseNota(inputNota, resultado.letra);
            localStorage.setItem(chave(maquina, "nota"), resultado.letra);
        }

        // Notas dos fatores: ao editar, salva e recalcula a nota final
        camposFator.forEach(function (input) {
            input.addEventListener("input", function () {
                localStorage.setItem(chave(maquina, input.dataset.fator), input.value);
                recalcularNota();
            });
        });

        // Indicadores de parada (Tempo, Horas, Custo): apenas salva
        camposIndicador.forEach(function (input) {
            input.addEventListener("input", function () {
                localStorage.setItem(chave(maquina, input.dataset.indicador), input.value);
            });
        });

        // Permite também editar a nota final manualmente, se desejado
        if (inputNota) {
            inputNota.addEventListener("input", function () {
                aplicarClasseNota(inputNota, inputNota.value);
                localStorage.setItem(chave(maquina, "nota"), inputNota.value);
            });
        }
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll(".cartao-equipamento").forEach(iniciarCartao);
    });
})();
