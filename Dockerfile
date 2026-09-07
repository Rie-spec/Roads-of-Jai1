FROM php:8.2-apache

COPY . /var/www/html/

RUN sed -i 's!/var/www/html!/var/www/html/views!g' /etc/apache2/sites-available/000-default.conf

RUN echo "DirectoryIndex login.php index.html" >> /etc/apache2/apache2.conf

RUN echo "Alias /css /var/www/html/public/css" >> /etc/apache2/conf-available/alias.conf
RUN echo "Alias /js /var/www/html/public/js" >> /etc/apache2/conf-available/alias.conf
RUN echo "Alias /public /var/www/html/public" >> /etc/apache2/conf-available/alias.conf
RUN a2enconf alias

RUN chown -R www-data:www-data /var/www/html/ && chmod -R 755 /var/www/html/

RUN a2enmod rewrite