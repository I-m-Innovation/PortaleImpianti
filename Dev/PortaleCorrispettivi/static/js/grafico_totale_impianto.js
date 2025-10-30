console.log('grafico_totale_impianto.js CARICATO - VERSIONE OTTIMIZZATA');

function estraiValoreNumerico(elemento) {
    if (!elemento) return 0;
    const testo = elemento.textContent || '';
    if (testo === 'NuN' || testo === 'Nun' || testo.trim() === '') return 0;
    return parseFloat(testo.replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
}

// Funzione per formattare il nickname
function formatNickname(nickname) {
    if (!nickname) return '';
    
    return nickname
        .split('_')
        .map(word => 
            word.charAt(0).toUpperCase() +  
            word.slice(1).toLowerCase()     
        )
        .join(' ');
}

function leggiTotaliDalleTabelle() {
    console.log('[GRAFICO TOTALE] Lettura totali dalle tabelle');
    const totaliAnnuali = [];
    const tabelle = document.querySelectorAll('.js-tabella-corrispettivi');
    
    tabelle.forEach(tabella => {
        const anno = parseInt(tabella.getAttribute('data-anno'));
        if (isNaN(anno)) return;
        
        totaliAnnuali.push({
            anno: anno,
            energia: estraiValoreNumerico(tabella.querySelector('.totale-energia')),
            tfo: estraiValoreNumerico(tabella.querySelector('.totale-corrispettivo-incentivo')),
            cni: estraiValoreNumerico(tabella.querySelector('.totale-CNI')),
            fatturazione: estraiValoreNumerico(tabella.querySelector('.totale-fatturazione-tfo')),
            pagamenti: estraiValoreNumerico(tabella.querySelector('.totale-incassi'))
        });
    });
    
    return totaliAnnuali;
}

function creaGraficoETabellaRiepilogativa(totaliAnnuali, nickname) {
    console.log('[GRAFICO TOTALE] Creazione grafico con dati:', totaliAnnuali);
    const chartContainer = document.getElementById('chart_totale_impianto');
    
    if (!chartContainer || !totaliAnnuali || totaliAnnuali.length === 0) {
        console.error('[GRAFICO TOTALE] Dati mancanti o container non trovato');
        chartContainer.innerHTML = '<div class="alert alert-warning">Nessun dato disponibile per il grafico.</div>';
        return;
    }

    // Ordina gli anni in ordine crescente
    totaliAnnuali.sort((a, b) => a.anno - b.anno);

    // Prepara i dati per la tabella riepilogativa
    const totaliComplessivi = {
        energia: totaliAnnuali.reduce((sum, anno) => sum + (anno.energia || 0), 0),
        corrispettivi: totaliAnnuali.reduce((sum, anno) => sum + (anno.tfo || 0) + (anno.cni || 0), 0),
        fatturazione: totaliAnnuali.reduce((sum, anno) => sum + (anno.fatturazione || 0), 0),
        incassi: totaliAnnuali.reduce((sum, anno) => sum + (anno.pagamenti || 0), 0)
    };

    // Aggiorna la tabella riepilogativa
    const tbody = document.querySelector('#tabella_totale_impianto tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr class="table-info fw-bold">
                <td>Totale (tutti gli anni)</td>
                <td class="text-end">${totaliComplessivi.energia.toLocaleString('it-IT', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</td>
                <td class="text-end">${totaliComplessivi.corrispettivi.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="text-end">${totaliComplessivi.fatturazione.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td class="text-end">${totaliComplessivi.incassi.toLocaleString('it-IT', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            </tr>`;
    }

    // Prepara i dati per il grafico
    const categorie = totaliAnnuali.map(a => a.anno.toString());
    const datiEnergia = totaliAnnuali.map(a => a.energia || 0);
    const datiCorrispettivi = totaliAnnuali.map(a => (a.tfo || 0) + (a.cni || 0));
    const datiFatturazione = totaliAnnuali.map(a => a.fatturazione || 0);
    const datiIncassi = totaliAnnuali.map(a => a.pagamenti || 0);

    // Crea il grafico
    Highcharts.chart('chart_totale_impianto', {
        chart: { 
            type: 'column',
            zoomType: 'xy',
            height: 450,
            backgroundColor: 'transparent',
            style: {
                fontFamily: 'Arial, sans-serif'
            }
        },
        title: { 
            text: `Andamento Annuale ${formatNickname(nickname)}`,
            style: { 
                fontSize: '18px', 
                fontWeight: 'bold',
                color: '#333'
            }
        },
        subtitle: {
            text: 'Energia incentivata, corrispettivi TFO, fatturazione e incassi (dati sommati)',
            style: { 
                fontSize: '0.8em', 
                fontWeight: 'normal',
                color: '#666'
            }
        },
        xAxis: {
            categories: categorie,
            crosshair: true,
            labels: {
                style: {
                    fontSize: '12px'
                }
            }
        },
        yAxis: [{
            min: 0,
            title: { 
                text: 'Energia (kWh)',
                style: {
                    color: '#7cb5ec'
                }
            },
            labels: {
                format: '{value:,.0f}',
                style: {
                    color: '#7cb5ec'
                }
            }
        }, {
            min: 0,
            title: { 
                text: 'Importi (€)',
                style: {
                    color: 'rgb(255, 107, 107)'
                }
            },
            labels: {
                format: '{value:,.0f} €',
                style: {
                    color: 'rgb(255, 107, 107)'
                }
            },
            opposite: true
        }],
        tooltip: {
            shared: true,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: '#ddd',
            borderRadius: 5,
            borderWidth: 1,
            shadow: true,
            useHTML: true,
            style: {
                padding: '10px',
                fontSize: '13px'
            }
        },
        plotOptions: {
            column: {
                borderWidth: 0,
                groupPadding: 0.1,
                pointPadding: 0.05
            },
            series: {
                dataLabels: {
                    enabled: false
                }
            }
        },
        legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom',
            borderWidth: 0,
            itemStyle: {
                fontWeight: 'normal'
            }
        },
        series: [{
            name: 'Energia Incentivata',
            type: 'spline',
            yAxis: 0,
            data: datiEnergia,
            color: '#7cb5ec',
            tooltip: { 
                valueSuffix: ' kWh',
                valueDecimals: 0
            }
        }, {
            name: 'Corrispettivi TFO',
            yAxis: 1,
            data: datiCorrispettivi,
            color: 'rgb(65,105,225)',
            tooltip: { 
                valueSuffix: ' €',
                valueDecimals: 2
            }
        }, {
            name: 'Fatturazione TFO',
            yAxis: 1,
            data: datiFatturazione,
            color: 'rgb(255,107,107)',
            tooltip: { 
                valueSuffix: ' €',
                valueDecimals: 2
            }
        }, {
            name: 'Incassi',
            yAxis: 1,
            data: datiIncassi,
            color: 'rgb(50,205,50)',
            tooltip: { 
                valueSuffix: ' €',
                valueDecimals: 2
            }
        }]
    });
}

function avviaGrafico() {
    const chartContainer = document.getElementById('chart_totale_impianto');
    if (!chartContainer) {
        console.error('[GRAFICO TOTALE] Container non trovato');
        return;
    }

    const dataContainer = document.querySelector('[data-nickname]');
    const nickname = dataContainer ? dataContainer.getAttribute('data-nickname') : 'Impianto';

    // Mostra lo spinner
    chartContainer.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div><p class="mt-2">Caricamento dati...</p></div>';

    // Aspetta che il DOM sia completamente caricato
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            const totali = leggiTotaliDalleTabelle();
            creaGraficoETabellaRiepilogativa(totali, nickname);
        });
    } else {
        // Se il DOM è già pronto, aspetta un attimo per assicurarsi che le tabelle siano caricate
        setTimeout(() => {
            const totali = leggiTotaliDalleTabelle();
            console.log('Dati letti dalle tabelle:', totali);
            creaGraficoETabellaRiepilogativa(totali, nickname);
        }, 2000);
    }
}

// Avvia il grafico quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', avviaGrafico);
} else {
    avviaGrafico();
}