import React, { useState, useEffect } from "react";
import { 
    generateWhatsAppMessage, 
    generateShortWhatsAppMessage, 
    copyToClipboard, 
    openWhatsApp,
    formatPhoneNumber
} from '../utils/whatsappUtils';

function WhatsAppMessage({ data }) {
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('full'); // 'full' or 'short'
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isManualInput, setIsManualInput] = useState(false);
    const [toast, setToast] = useState(null);
    const unit = data;

    useEffect(() => {
        if (unit) {
            const newMessage = messageType === 'full' 
                ? generateWhatsAppMessage(unit)
                : generateShortWhatsAppMessage(unit);
            setMessage(newMessage);
            
            // Set phone number from house data or manual input
            if (unit.whatsapp_number && unit.whatsapp_number.trim() !== '') {
                setPhoneNumber(formatPhoneNumber(unit.whatsapp_number));
                setIsManualInput(false);
            } else {
                setPhoneNumber('');
                setIsManualInput(true);
            }
        }
    }, [unit, messageType]);

    const showToast = (msg, type = 'success') => {
        setToast({ message: msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCopyToClipboard = async () => {
        const result = await copyToClipboard(message);
        showToast(result.message, result.success ? 'success' : 'error');
    };

    const handleOpenWhatsApp = () => {
        if (phoneNumber && phoneNumber.trim() !== '') {
            openWhatsApp(message, phoneNumber, 'web');
        } else {
            openWhatsApp(message, '', 'web');
        }
    };

    const handleOpenWhatsAppMobile = () => {
        if (phoneNumber && phoneNumber.trim() !== '') {
            openWhatsApp(message, phoneNumber, 'mobile');
        } else {
            openWhatsApp(message, '', 'mobile');
        }
    };

    const handlePhoneNumberChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
    };

    return (
        <div className="p-4">
            {toast && (
                <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'} mb-4`}>
                    <span>{toast.message}</span>
                </div>
            )}
            <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                <h3 className="text-base font-semibold">Pesan WhatsApp untuk Penagihan</h3>

                <div className="flex gap-2 shrink-0">
                    <button
                        onClick={() => setMessageType('full')}
                        className={`px-3 py-1 rounded text-sm ${
                            messageType === 'full' 
                                ? 'bg-primary text-primary-content'
                                : 'bg-base-200 text-base-content/70'
                        }`}
                    >
                        Lengkap
                    </button>
                    <button
                        onClick={() => setMessageType('short')}
                        className={`px-3 py-1 rounded text-sm ${
                            messageType === 'short'
                                ? 'bg-primary text-primary-content'
                                : 'bg-base-200 text-base-content/70'
                        }`}
                    >
                        Singkat
                    </button>
                </div>
            </div>

            {/* Phone Number Input Section */}
            <div className="mb-4 p-3 bg-base-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-base-content/70">
                        Nomor WhatsApp Tujuan:
                    </label>
                    {unit.whatsapp_number && (
                        <span className="text-xs text-base-content/70">
                            {isManualInput ? 'Manual Input' : 'From Database'}
                        </span>
                    )}
                </div>
                
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={phoneNumber}
                        onChange={handlePhoneNumberChange}
                        placeholder="Masukkan nomor WhatsApp (08xxx atau 628xxx)"
                        className="input input-bordered input-sm flex-1"
                    />
                    
                    {unit.whatsapp_number && (
                        <button
                            onClick={() => {
                                if (isManualInput) {
                                    setPhoneNumber(formatPhoneNumber(unit.whatsapp_number));
                                    setIsManualInput(false);
                                } else {
                                    setPhoneNumber('');
                                    setIsManualInput(true);
                                }
                            }}
                            className="btn btn-sm btn-ghost"
                        >
                            {isManualInput ? 'Use DB' : 'Manual'}
                        </button>
                    )}
                </div>
                
                {phoneNumber && (
                    <p className="text-xs text-success mt-1">
                        ✓ Akan dikirim ke: +{phoneNumber}
                    </p>
                )}
            </div>
            
            <div className="bg-base-200 p-4 rounded-lg mb-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono">{message}</pre>
            </div>

            <div className="flex gap-3 flex-wrap">
                <button
                    onClick={handleCopyToClipboard}
                    className="btn btn-primary btn-sm flex items-center gap-2"
                >
                    <span role="img" aria-label="copy">📋</span> Salin Pesan
                </button>
                
                <button
                    onClick={handleOpenWhatsApp}
                    className="btn btn-success btn-sm flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.472-.148-.67.15-.197.297-.767.967-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.007-.372-.009-.571-.009-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.205 5.077 4.372.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.617h-.001a9.87 9.87 0 01-4.988-1.357l-.357-.213-3.707.974.991-3.617-.232-.372a9.86 9.86 0 01-1.51-5.26c.001-5.455 4.436-9.89 9.893-9.89 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.896 6.992c-.003 5.455-4.438 9.89-9.89 9.89zm8.413-18.304A11.815 11.815 0 0012.05 0C5.495 0 .06 5.435.058 12.086c0 2.13.557 4.213 1.617 6.045L0 24l6.063-1.593a11.93 11.93 0 005.982 1.523h.005c6.554 0 11.89-5.435 11.893-12.086a11.82 11.82 0 00-3.478-8.349z"/></svg>
                    WhatsApp Web
                </button>

                <button
                    onClick={handleOpenWhatsAppMobile}
                    className="btn btn-success btn-sm flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.472-.148-.67.15-.197.297-.767.967-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.007-.372-.009-.571-.009-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.205 5.077 4.372.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.617h-.001a9.87 9.87 0 01-4.988-1.357l-.357-.213-3.707.974.991-3.617-.232-.372a9.86 9.86 0 01-1.51-5.26c.001-5.455 4.436-9.89 9.893-9.89 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.896 6.992c-.003 5.455-4.438 9.89-9.89 9.89zm8.413-18.304A11.815 11.815 0 0012.05 0C5.495 0 .06 5.435.058 12.086c0 2.13.557 4.213 1.617 6.045L0 24l6.063-1.593a11.93 11.93 0 005.982 1.523h.005c6.554 0 11.89-5.435 11.893-12.086a11.82 11.82 0 00-3.478-8.349z"/></svg>
                    WhatsApp Mobile
                </button>
            </div>

            <div className="mt-4 text-sm text-base-content/70">
                <p><strong>Tips:</strong></p>
                <ul className="list-disc list-inside mt-2">
                    <li>Pilih &quot;Lengkap&quot; untuk pesan formal atau &quot;Singkat&quot; untuk pesan praktis</li>
                    <li>Masukkan nomor WhatsApp tujuan (format: 08xxx atau 628xxx)</li>
                    <li>Klik &quot;Salin Pesan&quot; untuk menyalin ke clipboard</li>
                    <li>Klik &quot;WhatsApp Web&quot; untuk membuka di browser</li>
                    <li>Klik &quot;WhatsApp Mobile&quot; untuk membuka aplikasi WhatsApp</li>
                </ul>
                
                {phoneNumber && (
                    <div className="mt-3 p-2 bg-success/10 rounded">
                        <p className="text-success font-medium">
                            ✓ Siap kirim ke: +{phoneNumber}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WhatsAppMessage;
