<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre        = htmlspecialchars($_POST['nombre'] ?? '');
    $correo        = htmlspecialchars($_POST['correo'] ?? '');
    $telefono      = htmlspecialchars($_POST['telefono'] ?? '');
    $tipo_consulta = htmlspecialchars($_POST['tipo_consulta'] ?? '');
    $como_conocio  = htmlspecialchars($_POST['como_conocio'] ?? '');
    $mensajeTexto  = htmlspecialchars($_POST['mensaje'] ?? '');

    $mail = new PHPMailer(true);

    try {
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;
        $mail->Username = 'ecogaia2025@gmail.com';
        $mail->Password = 'mqesxbwekmxcsnzt'; // contraseña de aplicación
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // Para evitar problemas con certificados en local
        $mail->SMTPOptions = [
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ];

        $mail->setFrom($correo, $nombre);
        $mail->addAddress('ecogaia2025@gmail.com');

        $mail->isHTML(false);
        $mail->Subject = 'Formulario de contacto de pagina web';
        $mail->Body = 
"📩 Nuevo mensaje desde el formulario web:

Nombre: $nombre
Correo: $correo
Teléfono: $telefono
Tipo de consulta: $tipo_consulta
Cómo nos conoció: $como_conocio

Mensaje:
$mensajeTexto";

        $mail->send();

        // Redirigir de nuevo con mensaje
        header("Location: formulario.html?status=ok");
        exit;

    } catch (Exception $e) {
        header("Location: formulario.html?status=error&msg=" . urlencode($mail->ErrorInfo));
        exit;
    }
} else {
    header("Location: formulario.html");
    exit;
}