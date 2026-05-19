import { useState, useEffect, useRef } from 'react';
import { negocioService } from '../services/negocioService';
import { IoBusinessOutline } from 'react-icons/io5';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import './Negocio.css';

export const Negocio = () => {
    const [negocios, setNegocios] = useState([]);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [subiendoImagen, setSubiendoImagen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);

    const [negocioForm, setNegocioForm] = useState({
        id_negocio: null,
        razon_social: '',
        logo_url: '',
        descripcion: '',
        telefono: '',
        email: '',
        direccion: '',
        redes_sociales: {
            facebook: '',
            instagram: '',
            twitter: '',
            linkedin: ''
        }
    });

    useEffect(() => {
        cargarNegocios();
    }, []);

    const cargarNegocios = async () => {
        try {
            const data = await negocioService.obtenerNegocios();
            setNegocios(data);
        } catch (error) {
            console.error('Error al obtener negocios', error);
        }
    };

    const abrirModalCrear = () => {
        setModoEdicion(false);
        setNegocioForm({
            id_negocio: null,
            razon_social: '',
            logo_url: '',
            descripcion: '',
            telefono: '',
            email: '',
            direccion: '',
            redes_sociales: {
                facebook: '',
                instagram: '',
                twitter: '',
                linkedin: ''
            }
        });
        setPreviewUrl(null);
        setMostrarModal(true);
    };

    const abrirModalEditar = (negocio) => {
        setModoEdicion(true);
        setNegocioForm({
            ...negocio,
            redes_sociales: negocio.redes_sociales || {
                facebook: '',
                instagram: '',
                twitter: '',
                linkedin: ''
            }
        });
        setPreviewUrl(negocio.logo_url ? `http://localhost:3000${negocio.logo_url}` : null);
        setMostrarModal(true);
    };

    const cerrarModal = () => {
        setMostrarModal(false);
        setPreviewUrl(null);
    };

    const onFileSelected = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('El archivo es demasiado grande. Máximo 5MB');
            return;
        }

        // Validar tipo
        if (!file.type.startsWith('image/')) {
            alert('Solo se permiten archivos de imagen');
            return;
        }

        // Preview local
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target.result);
        };
        reader.readAsDataURL(file);

        // Subir al servidor
        setSubiendoImagen(true);
        try {
            const data = await negocioService.subirImagen(file);
            setNegocioForm({ ...negocioForm, logo_url: data.url });
            console.log('Imagen subida:', data.url);
        } catch (error) {
            console.error('Error al subir imagen', error);
            alert('Error al subir la imagen: ' + (error.response?.data?.message || 'Error desconocido'));
            setPreviewUrl(null);
        } finally {
            setSubiendoImagen(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNegocioForm({
            ...negocioForm,
            [name]: value
        });
    };

    const handleRedesSocialesChange = (e) => {
        const { name, value } = e.target;
        setNegocioForm({
            ...negocioForm,
            redes_sociales: {
                ...negocioForm.redes_sociales,
                [name]: value
            }
        });
    };

    const guardarNegocio = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!negocioForm.razon_social || negocioForm.razon_social.trim() === '') {
            alert('La razón social es obligatoria');
            return;
        }

        try {
            if (modoEdicion) {
                await negocioService.actualizarNegocio(negocioForm.id_negocio, negocioForm);
                alert('Negocio actualizado correctamente');
            } else {
                await negocioService.agregarNegocio(negocioForm);
                alert('Negocio creado correctamente');
            }
            cargarNegocios();
            cerrarModal();
        } catch (error) {
            console.error('Error al guardar negocio', error);
            alert('Error: ' + (error.response?.data?.message || 'Error desconocido'));
        }
    };

    const getLogoUrl = (logoUrl) => {
        if (!logoUrl) return '';
        return logoUrl.startsWith('http') ? logoUrl : `http://localhost:3000${logoUrl}`;
    };

    return (
        <div className="negocio-container">
            <div className="titulo-container">
                <h2 className="titulo">
                    <IoBusinessOutline /> Gestión de Negocio
                </h2>
                <button className="btn-add" onClick={abrirModalCrear}>Crear Negocio</button>
            </div>

            <div className="negocio-grid">
                {negocios.map(negocio => (
                    <div key={negocio.id_negocio} className="negocio-card" onClick={() => abrirModalEditar(negocio)}>
                        <div className="negocio-logo">
                            {negocio.logo_url ? (
                                <img src={getLogoUrl(negocio.logo_url)} alt={negocio.razon_social} />
                            ) : (
                                <div className="logo-placeholder">Sin Logo</div>
                            )}
                        </div>

                        <div className="negocio-info">
                            <h3>{negocio.razon_social}</h3>
                            <p className="descripcion">{negocio.descripcion || 'Sin descripción'}</p>

                            <div className="contacto">
                                {negocio.email && (
                                <div>
                                    <MdEmail /> {negocio.email}
                                </div>
                                )}
                                {negocio.telefono && (
                                    <div>
                                        <MdPhone /> {negocio.telefono}
                                    </div>
                                )}
                                {negocio.direccion && (
                                    <div>
                                        <MdLocationOn /> {negocio.direccion}
                                    </div>
                                )}
                            </div>

                            {negocio.redes_sociales && (
                                <div className="redes-sociales">
                                    {negocio.redes_sociales.facebook && (
                                        <a href={negocio.redes_sociales.facebook} target="_blank" rel="noopener noreferrer" title="Facebook">📘</a>
                                    )}
                                    {negocio.redes_sociales.instagram && (
                                        <a href={negocio.redes_sociales.instagram} target="_blank" rel="noopener noreferrer" title="Instagram">📸</a>
                                    )}
                                    {negocio.redes_sociales.twitter && (
                                        <a href={negocio.redes_sociales.twitter} target="_blank" rel="noopener noreferrer" title="Twitter">🐦</a>
                                    )}
                                    {negocio.redes_sociales.linkedin && (
                                        <a href={negocio.redes_sociales.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn">💼</a>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {mostrarModal && (
                <div className="modal-backdrop" onClick={cerrarModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modoEdicion ? 'Editar Negocio' : 'Crear Nuevo Negocio'}</h2>
                            <button className="btn-close" onClick={cerrarModal}>X</button>
                        </div>

                        <form onSubmit={guardarNegocio} className="modal-form">
                            {/* Logo Upload */}
                            <div className="upload-section">
                                <label>Logo del Negocio</label>

                                <div className="preview-container">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="logo-preview" />
                                    ) : (
                                        <div className="preview-placeholder">Sin imagen</div>
                                    )}
                                </div>

                                <div className="upload-actions">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={onFileSelected}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                    type="button"
                                    className="btn-upload"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={subiendoImagen}
                                    >
                                        {subiendoImagen ? 'Subiendo...' : 'Seleccionar Imagen'}
                                    </button>
                                    <small className="hint">Formatos: JPG, PNG, GIF, WEBP, SVG (Máx. 5MB)</small>
                                </div>
                            </div>

                            {/* Información Básica */}
                            <div className="form-grid">
                                <div className="full-width">
                                    <label>Razón Social *</label>
                                    <input
                                        type="text"
                                        name="razon_social"
                                        value={negocioForm.razon_social}
                                        onChange={handleChange}
                                        required
                                        minLength="3"
                                    />
                                </div>

                                <div className="full-width">
                                    <label>Descripción</label>
                                    <textarea
                                        name="descripcion"
                                        value={negocioForm.descripcion}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Describe tu negocio..."
                                    />
                                </div>

                                <div>
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={negocioForm.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div>
                                    <label>Teléfono</label>
                                    <input
                                        type="tel"
                                        name="telefono"
                                        value={negocioForm.telefono}
                                        onChange={handleChange}
                                        placeholder="Ej: +57 300 123 4567"
                                    />
                                </div>

                                <div className="full-width">
                                    <label>Dirección</label>
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={negocioForm.direccion}
                                        onChange={handleChange}
                                        placeholder="Dirección física del negocio"
                                    />
                                </div>
                            </div>
                            
                            {/* Redes Sociales */}
                            <div className="redes-section">
                                <label className="section-title">Redes Sociales</label>
                                <div className="form-grid">
                                    <div>
                                        <label>📘 Facebook</label>
                                        <input
                                            type="url"
                                            name="facebook"
                                            value={negocioForm.redes_sociales.facebook}
                                            onChange={handleRedesSocialesChange}
                                            placeholder="https://facebook.com/tu-negocio"
                                        />
                                    </div>

                                    <div>
                                        <label>📸 Instagram</label>
                                        <input
                                            type="url"
                                            name="instagram"
                                            value={negocioForm.redes_sociales.instagram}
                                            onChange={handleRedesSocialesChange}
                                            placeholder="https://instagram.com/tu-negocio"
                                        />
                                    </div>

                                    <div>
                                        <label>🐦 Twitter/X</label>
                                        <input
                                            type="url"
                                            name="twitter"
                                            value={negocioForm.redes_sociales.twitter}
                                            onChange={handleRedesSocialesChange}
                                            placeholder="https://twitter.com/tu-negocio"
                                        />
                                    </div>

                                    <div>
                                        <label>💼 LinkedIn</label>
                                        <input
                                            type="url"
                                            name="linkedin"
                                            value={negocioForm.redes_sociales.linkedin}
                                            onChange={handleRedesSocialesChange}
                                            placeholder="https://linkedin.com/company/tu-negocio"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button type="submit" className="btn-submit" disabled={subiendoImagen}>
                                {modoEdicion ? 'Actualizar Negocio' : 'Crear Negocio'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};