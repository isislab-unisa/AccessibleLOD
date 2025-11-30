import React, { use, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { base_url, kghb_url } from '../api';
import axios from 'axios';
import RadarChart from '../components/radar_chart'; 
import RadialBarChart from '../components/radial_bar';
import GaugeChart from '../components/gauge_chart';
import { Row, Col, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Footer from '../components/footer';
import { formatFairnessDataForBrushChart } from '../utils';
import BrushChart from '../components/line_chart';
import ReactMarkdown from 'react-markdown';
import Navbar from '../components/navbar';



function FairnessInfo(){
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const dataset_id = queryParams.get('dataset_id');
    const [fairness_data, setFairnessData] = useState({});
    const [dataset_metadata, setDatasetMetadata] = useState(false);
    const [showDownloads, setShowDownloads] = useState(false);
    const [fairness_ot, setFairnessOt] = useState(false);
    const [brushSeriesFairness, setBrushSeriesFairness] = useState([]);
    const [minDate, setMinDate] = useState(null);
    const [maxDate, setMaxDate] = useState(null);
    const [llmExplanation, setLlmExplanation] = useState('');
    const [showExplanation, setShowExplanation] = useState(false);
    const [loadingExplanation, setLoadingExplanation] = useState(false);
    const [animatedText, setAnimatedText] = useState('');
    const [done, setDone] = useState(false);
    // Over time explanation
    const [llmExplanationOT, setLlmExplanationOT] = useState('');
    const [showExplanationOT, setShowExplanationOT] = useState(false);
    const [loadingExplanationOT, setLoadingExplanationOT] = useState(false);
    const [animatedTextOT, setAnimatedTextOT] = useState('');
    const [doneOT, setDoneOT] = useState(false);
    // Filter and search for accessibility table
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    useEffect(() => {
        async function getFairnessData(){
            try {
                //TODO: uncomment this below when the backend will be connected with KGHB
                //Same trasformation done by KGHeartBeat
                //let sanitizedId = dataset_id.replace(/[\\/*?:"<>|]/g, "");
                //sanitizedId = dataset_id.replace(/[\\/*?:"<>|]/g, "");
                //sanitizedId = sanitizedId.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, "");
                //sanitizedId = sanitizedId.replace(/\s+/g, "");

                const response = await axios.get(`${base_url}/AccessibleLOD_data/accessibility_data/${dataset_id}`);
                console.log(response.data)
                //const responseOT = await axios.get(`${kghb_url}/fairness/fairness_over_time/${sanitizedId}`);
                setFairnessData(response.data)
                //setFairnessOt(responseOT.data);
            } catch (error) {
            console.error("Error:",error)
            }
        } 
        getFairnessData();
        async function getJsonData(){
            try {
                const response = await axios.get(`${base_url}/AccessibleLOD_data/dataset_metadata/${dataset_id}`);
                setDatasetMetadata(response.data)
            } catch (error) {
            console.error("Error:",error)
            }
        } 
        getJsonData();
    }, [])

    const chartReady = fairness_data && Object.keys(fairness_data).length > 0;

    const f_chart_categories = [
        "operable",
        "understandable",
        "robust",
        "perceivable",
    ]
    const f_values = f_chart_categories.map(category =>
        parseFloat(fairness_data[category] || 0)
    );
/*     const fetchLlmExplanation = async () => {
        setLoadingExplanation(true);
        try {
            const response = await axios.post(`${base_url}/llm/llm_explain_fair`,{
                fair_data: fairness_data
            });
            setLlmExplanation(response.data || "No explanation returned.");
            setShowExplanation(true);
        } catch (error) {
            console.error("Error fetching LLM explanation:", error);
            setLlmExplanation("Failed to fetch explanation.");
            setShowExplanation(true);
        } finally {
            setLoadingExplanation(false);
        }
    }; */

/*     const fetchLlmExplanationOT = async () => {
        setLoadingExplanationOT(true);
        try {
            const response = await axios.post(`${base_url}/llm/llm_explain_fairness_score_ot`,{
                fair_data: fairness_ot
            });
            setLlmExplanationOT(response.data || "No explanation returned.");
            setShowExplanationOT(true);
        } catch (error) {
            console.error("Error fetching LLM explanation:", error);
            setLlmExplanationOT("Failed to fetch explanation.");
            setShowExplanationOT(true);
        } finally {
            setLoadingExplanationOT(false);
        }
    };
 */
    // Accessibility data formatting and categorization
    const formatLabel = (key) => {
        return key
            .replace(/_/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
    };

    const getScoreColor = (value) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || value === '' || value === null) return 'text-muted';
        if (numValue >= 0.7) return 'text-success fw-bold';
        if (numValue >= 0) return 'text-warning fw-bold';
        return 'text-danger fw-bold';
    };

    const getScoreBadge = (value) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || value === '' || value === null) return 'secondary';
        if (numValue >= 0.7) return 'success';
        if (numValue >= 0) return 'warning';
        return 'danger';
    };

    const categorizeMetric = (key) => {
        const perceivableKeys = ['audio', 'audio_metadata', 
                                 'image', 'image_metadata', 'video', 
                                 'video_metadata', 'accessibility_for_deaf', 
                                 'accessibility_for_visually_impaired'];
        const acc4visuallyImpairedKeys = ['alt_image_score', 'audio_description'];
        const acc4deafKeys = ['video_description', 'video_sign_language', 'audio_sign_language','video_subtitle','audio_subtitle'];
        const operableKeys = ['robots_txt', 'open_license','contact_person','dump_size','auth','dump_format','alternative_access_point_score'];
        const understandableKeys = ['description_readability', 'labels', 'lang', 'metadata_lang', 'example'];
        const robustKeys = ['canonical_ID', 'metadata_broken_links', 'version', 'robust','webpage_status'];

        if (perceivableKeys.includes(key)) return 'Perceivable';
        if (operableKeys.includes(key)) return 'Operable';
        if (understandableKeys.includes(key)) return 'Understandable';
        if (robustKeys.includes(key)) return 'Robust';
        if (acc4visuallyImpairedKeys.includes(key)) return 'Accessibility for Visually Impaired';
        if (acc4deafKeys.includes(key)) return 'Accessibility for Deaf or Hard-of-hearing Users';
        return 'Other';
    };

        // Define which keys to display in the accessibility table
    const displayKeys = [
        'alt_image_score',
        'audio',
        'video',
        'audio_metadata',
        'video_metadata',
        'image_metadata',
        'accessibility_for_deaf',
        'accessibility_for_visually_impaired',
        'webpage_status',
        'robots_txt',
        'description_readability',
        'labels',
        'image',
        'example',
        'canonical_ID',
        'metadata_broken_links',
        'version',
        'open_license',
        'contact_person',
        'alternative_access_point_score',
        'audio_description',
        'audio_sign_language',
        'audio_subtitle',
        'auth',
        'dump_format',
        'dump_size',
        'metadata_lang',
        'video_description',
        'video_sign_language',
        'video_subtitle',
        'lang',
    ];

    const renderValue = (value) => {
        if (value === '' || value === null || value === undefined) {
            return <span className="text-muted fst-italic">N/A</span>;
        }
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            return <span className={getScoreColor(value)}>{numValue.toFixed(4)}</span>;
        }
        return <span>{value}</span>;
    };

    const accessibilityMetrics = Object.entries(fairness_data)
        .filter(([key]) => displayKeys.includes(key))
        .map(([key, value]) => ({
            key,
            label: formatLabel(key),
            value: value.replace(',', '.'),
            category: categorizeMetric(key)
        }))
        .filter(metric => {
            const matchesSearch = metric.label.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === 'all' || metric.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

    const categories = ['all','Perceivable', 'Operable', 'Understandable', 'Robust', 'Accessibility for Visually Impaired', 'Accessibility for Deaf or Hard-of-hearing Users'];

    return (
        <>
        <div className="container-fluid mt-3 px-4">
            <Navbar />
        </div>
            <div className="container mt-3">
                <div className="text-center mb-4">
                {dataset_metadata?.keywords?.includes("ontology") ? (
                    <>
                    <h1 className="d-inline mb-4">{dataset_metadata.title}</h1>
                    <span className="badge bg-warning text-dark d-inline ms-2">Ontology</span>
                    </>
                ) : (
                    <>
                    <h1 className="d-inline mb-4">{dataset_metadata.title}</h1>
                    <span className="badge bg-secondary d-inline ms-2">Dataset</span>
                    </>
                )}
                </div>

                {dataset_metadata.description ? (
                    <p className="text-justify mb-5">{dataset_metadata.description.en}</p>
                ) : (
                    <p className="text-center mb-5">Loading Description data</p>
                )}

            {dataset_metadata && (
                <div className="card shadow-sm p-4 mb-5">
                    <h5 className="mb-3">Dataset Information</h5>
                    <Row>
                        {dataset_metadata.website && (
                            <Col md={6} className="mb-3">
                                <strong>Website: </strong>
                                <a href={dataset_metadata.website} target="_blank" rel="noopener noreferrer">
                                    {dataset_metadata.website}
                                </a>
                            </Col>
                        )}
                        {dataset_metadata.license ? (
                            <Col md={6} className="mb-3">
                                <strong>License: </strong>{dataset_metadata.license}
                            </Col>
                        ) : (
                            <Col md={6} className="mb-3">
                                <strong>License: </strong>Not specified
                            </Col>
                        )}
                        {dataset_metadata.contact_point.email || dataset_metadata.contact_point.name ? (
                            <Col md={6} className="mb-3">
                                <strong>Contact point</strong> <br />
                                <strong>email: </strong>{dataset_metadata.contact_point.email} <br />
                                <strong>name: </strong>{dataset_metadata.contact_point.name}
                            </Col>
                        ) : (
                            <Col md={6} className="mb-3">
                                <strong>Contact point not specified</strong>
                            </Col>
                        )}
                        {dataset_metadata.sparql[0] ? (
                            <Col md={6} className="mb-3">
                                <strong>SPARQL Endpoint: </strong>
                                <a href={dataset_metadata.sparql[0].access_url} target="_blank" rel="noopener noreferrer">
                                    {dataset_metadata.sparql[0].access_url}
                                </a>
                            </Col>
                        ) : (
                            <Col md={6} className="mb-3">
                                <strong>SPARQL Endpoint: </strong>Not specified
                            </Col>
                        )}
                        {(dataset_metadata?.other_download?.length > 0 || dataset_metadata?.full_download?.length > 0) && (
                             <Col md={6} className="mb-3">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowDownloads(!showDownloads)}
                                >
                                    {showDownloads ? 'Hide Downloadable Resources' : 'Show Downloadable Resources'}
                                </button>
                            </Col>
                        )}
                        {showDownloads && (
                            <div className="card shadow-sm p-4 mb-5">
                                <h5 className="mb-3">Downloadable Resources</h5>
                                {[...(dataset_metadata.full_download || []), ...(dataset_metadata.other_download || [])].map((item, index) => (
                                    <div key={index} className="mb-3">
                                        <p className="mb-1">
                                            <strong>{item.title || "Untitled resource"}</strong>
                                        </p>
                                        <a href={item.access_url || item.download_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                                            {item.access_url || item.download_url}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Row>
                </div>
            )}
{/*                 <div className="mb-3">
                    <small className="text-muted">
                        FAIR metrics last updated on: <b>{new Date(fairness_data.analysis_date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</b>. Assessment provided by <a href='https://kgheartbeat.di.unisa.it/' target='_blank' rel="noopener noreferrer">KGHeartBeat</a>.
                    </small>
                    <div className="my-3">
                        <button className="btn btn-outline-secondary" onClick={fetchLlmExplanation}>
                            {loadingExplanation ? 'Loading explanation...' : '🧠 Explain this assessment'}
                        </button>
                    </div>
                    {showExplanation && (
                        <div className="card shadow-sm p-3 my-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">LLM Generated Explanation</h5>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => setShowExplanation(false)}
                                    title="Close explanation"
                                >
                                    ✖
                                </button>
                            </div>
                            <small>Model used: <b>{llmExplanation.model_used}</b></small>
                            <hr />
                            <ReactMarkdown>{llmExplanation.llm_response}</ReactMarkdown>
                        </div>
                    )}
                </div> */}
                {chartReady ? (
                    <Row className="g-4">
                    <Col md={6} sm={12}>
                        <div className="card shadow-sm p-3">
                        <h5 className="card-title text-center"></h5>
                        <GaugeChart label={'Overall Score'} value={parseFloat(fairness_data['sum_overall'].replace(',','.'))} />
                        </div>
                    </Col>

                    <Col md={6} sm={12}>
                        <div className="card shadow-sm p-3">
                        <h5 className="card-title text-center"></h5>
                        <RadarChart
                            title={''}
                            categories={f_chart_categories}
                            seriesData={[{ name: fairness_data['KG'], data: f_values }]}
                            height={340}
                        />
                        </div>
                    </Col>
                    </Row>
                ) : (
                    <p className="text-center">Loading accessibility data...</p>
                )}

                {/* ACCESSIBILITY METRICS TABLE */}
                <div className="card shadow-sm p-4 mb-5 mt-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="mb-0">Accessibility Dimensions</h4>
                        <span className="badge bg-info text-dark">
                            {accessibilityMetrics.length} dimensions
                        </span>
                    </div>

                    {/* Search and Filter Controls */}
                    <Row className="mb-4">
                        <Col md={6}>
                            <div className="input-group">
                                <span className="input-group-text bg-light">
                                    🔍
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search metrics..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </Col>
                        <Col md={6}>
                            <select
                                className="form-select"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat === 'all' ? 'All Categories' : cat}
                                    </option>
                                ))}
                            </select>
                        </Col>
                    </Row>

                    {/* Responsive Table */}
                    <div className="table-responsive">
                        <Table hover bordered className="mb-0 align-middle">
                            <thead className="table-dark">
                                <tr>
                                    <th style={{ width: '35%' }}>Dimension</th>
                                    <th style={{ width: '25%' }}>Category</th>
                                    <th style={{ width: '20%' }} className="text-center">Value</th>
                                    <th style={{ width: '15%' }} className="text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {accessibilityMetrics.length > 0 ? (
                                    accessibilityMetrics.map((metric, index) => (
                                        <tr key={metric.key} className="hover-highlight">
                                            <td>
                                                <strong>{metric.label}</strong>
                                                {/* <br />
                                                <small className="text-muted font-monospace">{metric.key}</small> */}
                                            </td>
                                            <td>
                                                <span className={`badge bg-${
                                                    metric.category === 'Perceivable' ? 'info' :
                                                    metric.category === 'Operable' ? 'primary' :
                                                    metric.category === 'Understandable' ? 'teal' :
                                                    metric.category === 'Robust' ? 'indigo' :
                                                    metric.category === 'Overall Scores' ? 'purple' :
                                                    'secondary'
                                                } text-white`}>
                                                    {metric.category}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                {renderValue(metric.value)}
                                            </td>
                                            <td className="text-center">
                                                {metric.value !== '' && metric.value !== null && !isNaN(parseFloat(metric.value)) ? (
                                                    <span className={`badge bg-${getScoreBadge(metric.value)}`}>
                                                        {parseFloat(metric.value) >= 0.7 ? '✓ Good' :
                                                         parseFloat(metric.value) >= 0 ? '⚠ Neutral' :
                                                         '✗ Poor'}
                                                    </span>
                                                ) : (
                                                    <span className="badge bg-secondary">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-4">
                                            No metrics found matching your criteria
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 p-3 bg-light rounded">
                        <h6 className="mb-3">Score Legend:</h6>
                        <Row>
                            <Col md={4}>
                                <span className="badge bg-success me-2">✓ Good</span>
                                <small>Score ≥ 0.7</small>
                            </Col>
                            <Col md={4}>
                                <span className="badge bg-warning me-2">⚠ Neutral</span>
                                <small>Score 0 to 0.7</small>
                            </Col>
                            <Col md={4}>
                                <span className="badge bg-danger me-2">✗ Poor</span>
                                <small>Score &lt; 0</small>
                            </Col>
                        </Row>
                    </div>
                </div>

                    {/* <div className="mt-5">
                        <button className="btn btn-outline-secondary" onClick={fetchLlmExplanationOT}>
                            {loadingExplanationOT ? 'Loading explanation...' : '🧠 Explain the FAIR score over time'}
                        </button>
                    </div>
                    {showExplanationOT && (
                        <div className="card shadow-sm p-3 my-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">LLM Generated Explanation</h5>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => setShowExplanationOT(false)}
                                    title="Close explanation"
                                >
                                    ✖
                                </button>
                            </div>
                            <small>Model used: <b>{llmExplanationOT.model_used}</b></small>
                            <hr />
                            <ReactMarkdown>{llmExplanationOT.llm_response}</ReactMarkdown>
                        </div>
                    )}
                <Row className="g-1 mt-3">
                    { fairness_ot ? (
                        <Col md={12}>
                            <div className="card shadow-sm p-3">
                                <BrushChart
                                    data={brushSeriesFairness}
                                    xAxisLabel="Time"
                                    yAxisLabel="Fairness Score"
                                    minDate={minDate}
                                    maxDate={maxDate}
                                    height={340}
                                    kg_name={dataset_metadata.title}
                                />
                            </div>
                        </Col>
                    ) : (
                        <Col md={12}>
                            <div className="card shadow-sm p-3">
                                <h5 className="card-title text-center">Loading FAIRness data over time</h5>
                            </div>
                        </Col>
                    )}
                </Row> */}
            </div>
            <Footer />
            
            {/* Custom CSS for hover effects */}
            <style>{`
                .hover-highlight:hover {
                    background-color: #f8f9fa;
                    transition: background-color 0.2s ease;
                }
                .font-monospace {
                    font-family: 'Courier New', monospace;
                }
                .bg-teal {
                    background-color: #20c997 !important;
                }
                .bg-indigo {
                    background-color: #6610f2 !important;
                }
                .bg-purple {
                    background-color: #6f42c1 !important;
                }
            `}</style>
        </>
      );
}

export default FairnessInfo;